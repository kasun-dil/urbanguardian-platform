import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Incident } from "./useIncidents";
import type { Database } from "@/integrations/supabase/types";

type IncidentType = Database["public"]["Enums"]["incident_type"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];
type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];

export interface UpdateIncidentData {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  type?: IncidentType;
}

export function useUserIncidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's incidents
  const fetchUserIncidents = useCallback(async () => {
    if (!user) {
      setIncidents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (err) {
      console.error("Error fetching user incidents:", err);
      setError("Failed to load your incidents");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete incident
  const deleteIncident = async (incidentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("incidents")
        .delete()
        .eq("id", incidentId)
        .eq("user_id", user?.id);

      if (error) throw error;
      toast.success("Incident deleted successfully");
      await fetchUserIncidents();
      return true;
    } catch (err) {
      console.error("Error deleting incident:", err);
      toast.error("Failed to delete incident");
      return false;
    }
  };

  // Update incident
  const updateIncident = async (data: UpdateIncidentData): Promise<boolean> => {
    try {
      const { id, ...updateData } = data;
      
      const { error } = await supabase
        .from("incidents")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      toast.success("Incident updated successfully");
      await fetchUserIncidents();
      return true;
    } catch (err) {
      console.error("Error updating incident:", err);
      toast.error("Failed to update incident");
      return false;
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchUserIncidents();

    if (!user) return;

    const channel = supabase
      .channel("user_incidents_realtime")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "incidents",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUserIncidents, user]);

  return {
    incidents,
    loading,
    error,
    deleteIncident,
    updateIncident,
    refetch: fetchUserIncidents,
  };
}
