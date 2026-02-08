import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type IncidentType = Database["public"]["Enums"]["incident_type"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];
type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string | null;
  location: string;
  latitude: number;
  longitude: number;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reported_by: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface IncidentComment {
  id: string;
  incident_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentData {
  type: IncidentType;
  title: string;
  description?: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: IncidentSeverity;
}

// Helper to get or create guest ID
const getGuestId = (): string => {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
};

export function useIncidents() {
  const { user, profile } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all incidents
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setError("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create incident
  const createIncident = async (data: CreateIncidentData): Promise<boolean> => {
    try {
      const reportedBy = user && profile ? profile.full_name : "Anonymous";
      
      const { error } = await supabase.from("incidents").insert({
        ...data,
        user_id: user?.id || null,
        reported_by: reportedBy,
      });

      if (error) throw error;
      toast.success("Incident reported successfully!");
      await fetchIncidents();
      return true;
    } catch (err) {
      console.error("Error creating incident:", err);
      toast.error("Failed to report incident");
      return false;
    }
  };

  // Like incident
  const likeIncident = async (incidentId: string): Promise<boolean> => {
    try {
      const guestId = !user ? getGuestId() : null;

      // Check if already liked
      let query = supabase
        .from("incident_likes")
        .select("id")
        .eq("incident_id", incidentId);

      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("guest_id", guestId);
      }

      const { data: existingLike } = await query.maybeSingle();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from("incident_likes")
          .delete()
          .eq("id", existingLike.id);
        if (error) throw error;
        toast.success("Removed like");
      } else {
        // Like
        const { error } = await supabase.from("incident_likes").insert({
          incident_id: incidentId,
          user_id: user?.id || null,
          guest_id: guestId,
        });
        if (error) throw error;
        toast.success("Liked!");
      }

      await fetchIncidents();
      return true;
    } catch (err) {
      console.error("Error liking incident:", err);
      toast.error("Failed to update like");
      return false;
    }
  };

  // Add comment
  const addComment = async (incidentId: string, content: string): Promise<boolean> => {
    try {
      const authorName = user && profile ? profile.full_name : "Anonymous";

      const { error } = await supabase.from("incident_comments").insert({
        incident_id: incidentId,
        user_id: user?.id || null,
        author_name: authorName,
        content,
      });

      if (error) throw error;
      toast.success("Comment added!");
      await fetchIncidents();
      return true;
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment");
      return false;
    }
  };

  // Fetch comments for an incident
  const fetchComments = async (incidentId: string): Promise<IncidentComment[]> => {
    try {
      const { data, error } = await supabase
        .from("incident_comments")
        .select("*")
        .eq("incident_id", incidentId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching comments:", err);
      return [];
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchIncidents();

    const channel = supabase
      .channel("incidents_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        () => {
          fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    createIncident,
    likeIncident,
    addComment,
    fetchComments,
    refetch: fetchIncidents,
  };
}
