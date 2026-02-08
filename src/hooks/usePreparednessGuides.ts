import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type GuideCategory = Database["public"]["Enums"]["guide_category"];
type GuideRelevance = Database["public"]["Enums"]["guide_relevance"];

export interface PreparednessGuide {
  id: string;
  user_id: string;
  title: string;
  category: GuideCategory;
  relevance: GuideRelevance;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGuideData {
  title: string;
  category: GuideCategory;
  relevance: GuideRelevance;
  description: string;
}

export interface UpdateGuideData extends Partial<CreateGuideData> {
  id: string;
}

export const categoryLabels: Record<GuideCategory, string> = {
  natural_disasters: "Natural Disasters",
  general_preparedness: "General Preparedness",
  emergency_response: "Emergency Response",
  health_safety: "Health & Safety",
  infrastructure: "Infrastructure",
  community_resilience: "Community Resilience",
};

export const relevanceLabels: Record<GuideRelevance, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function usePreparednessGuides() {
  const [guides, setGuides] = useState<PreparednessGuide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuides = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("preparedness_guides")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (error: any) {
      console.error("Error fetching guides:", error);
      toast.error("Failed to load preparedness guides");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuides();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("preparedness_guides_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "preparedness_guides",
        },
        () => {
          fetchGuides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGuides]);

  const createGuide = async (data: CreateGuideData) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("You must be logged in to create a guide");
        return false;
      }

      const { error } = await supabase.from("preparedness_guides").insert({
        ...data,
        user_id: userData.user.id,
      });

      if (error) throw error;
      toast.success("Preparedness guide created successfully");
      return true;
    } catch (error: any) {
      console.error("Error creating guide:", error);
      toast.error(error.message || "Failed to create guide");
      return false;
    }
  };

  const updateGuide = async (data: UpdateGuideData) => {
    try {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from("preparedness_guides")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      toast.success("Preparedness guide updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating guide:", error);
      toast.error(error.message || "Failed to update guide");
      return false;
    }
  };

  const deleteGuide = async (id: string) => {
    try {
      const { error } = await supabase
        .from("preparedness_guides")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Preparedness guide deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting guide:", error);
      toast.error(error.message || "Failed to delete guide");
      return false;
    }
  };

  return {
    guides,
    loading,
    refetch: fetchGuides,
    createGuide,
    updateGuide,
    deleteGuide,
  };
}

// Hook for government agents to manage their own guides
export function useGovernmentGuides() {
  const { user } = useAuth();
  const [guides, setGuides] = useState<PreparednessGuide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuides = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("preparedness_guides")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (error: any) {
      console.error("Error fetching guides:", error);
      toast.error("Failed to load your guides");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  return {
    guides,
    loading,
    refetch: fetchGuides,
  };
}
