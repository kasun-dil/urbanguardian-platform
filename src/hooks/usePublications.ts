import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type PublicationAlertType = 
  | "weather_alert" 
  | "environmental_alert" 
  | "health_alert" 
  | "safety_alert" 
  | "infrastructure_alert" 
  | "general_announcement";

export type PublicationSeverity = "low" | "moderate" | "high" | "critical";

export interface Publication {
  id: string;
  user_id: string;
  alert_type: PublicationAlertType;
  severity: PublicationSeverity;
  title: string;
  department: string;
  description: string;
  forecast_info: string | null;
  recommendations: string[];
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface PublicationComment {
  id: string;
  publication_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
}

export interface PublicationLike {
  id: string;
  publication_id: string;
  user_id: string | null;
  guest_id: string | null;
  is_like: boolean;
}

const getGuestId = () => {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
};

export function usePublications() {
  const { user, profile } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReactions, setUserReactions] = useState<Record<string, boolean | null>>({});

  const fetchPublications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("official_publications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error("Error fetching publications:", error);
      toast({
        title: "Error",
        description: "Failed to load publications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserReactions = useCallback(async () => {
    const guestId = getGuestId();
    
    try {
      let query = supabase.from("publication_likes").select("*");
      
      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("guest_id", guestId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const reactions: Record<string, boolean | null> = {};
      data?.forEach((like) => {
        reactions[like.publication_id] = like.is_like;
      });
      setUserReactions(reactions);
    } catch (error) {
      console.error("Error fetching user reactions:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchPublications();
    fetchUserReactions();
  }, [fetchPublications, fetchUserReactions]);

  // Realtime subscription for publications AND likes
  useEffect(() => {
    const publicationsChannel = supabase
      .channel("publications-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "official_publications" },
        (payload) => {
          // Update specific publication in state for instant UI update
          if (payload.eventType === "UPDATE" && payload.new) {
            setPublications((prev) =>
              prev.map((pub) =>
                pub.id === payload.new.id ? { ...pub, ...payload.new } as Publication : pub
              )
            );
          } else {
            fetchPublications();
          }
        }
      )
      .subscribe();

    const likesChannel = supabase
      .channel("publication-likes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "publication_likes" },
        () => {
          // Re-fetch publications when likes change to get updated counts
          fetchPublications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(publicationsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [fetchPublications]);

  const createPublication = async (data: {
    alert_type: PublicationAlertType;
    severity: PublicationSeverity;
    title: string;
    department: string;
    description: string;
    forecast_info?: string;
    recommendations: string[];
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create publications",
        variant: "destructive",
      });
      return { error: new Error("Not authenticated") };
    }

    try {
      const { error } = await supabase.from("official_publications").insert({
        user_id: user.id,
        alert_type: data.alert_type,
        severity: data.severity,
        title: data.title,
        department: data.department,
        description: data.description,
        forecast_info: data.forecast_info || null,
        recommendations: data.recommendations,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Publication created successfully",
      });

      return { error: null };
    } catch (error) {
      console.error("Error creating publication:", error);
      toast({
        title: "Error",
        description: "Failed to create publication",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePublication = async (
    id: string,
    data: Partial<{
      alert_type: PublicationAlertType;
      severity: PublicationSeverity;
      title: string;
      department: string;
      description: string;
      forecast_info: string;
      recommendations: string[];
    }>
  ) => {
    try {
      const { error } = await supabase
        .from("official_publications")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Publication updated successfully",
      });

      return { error: null };
    } catch (error) {
      console.error("Error updating publication:", error);
      toast({
        title: "Error",
        description: "Failed to update publication",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deletePublication = async (id: string) => {
    try {
      const { error } = await supabase
        .from("official_publications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Publication deleted successfully",
      });

      return { error: null };
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast({
        title: "Error",
        description: "Failed to delete publication",
        variant: "destructive",
      });
      return { error };
    }
  };

  const toggleReaction = async (publicationId: string, isLike: boolean) => {
    const guestId = getGuestId();
    const currentReaction = userReactions[publicationId];
    
    // Find current publication for optimistic update
    const currentPub = publications.find((p) => p.id === publicationId);
    if (!currentPub) return;

    // Optimistic update function
    const updatePublicationCounts = (likeDelta: number, dislikeDelta: number) => {
      setPublications((prev) =>
        prev.map((pub) =>
          pub.id === publicationId
            ? {
                ...pub,
                likes_count: Math.max(0, pub.likes_count + likeDelta),
                dislikes_count: Math.max(0, pub.dislikes_count + dislikeDelta),
              }
            : pub
        )
      );
    };

    try {
      // If same reaction, remove it
      if (currentReaction === isLike) {
        // Optimistic update: remove reaction
        updatePublicationCounts(isLike ? -1 : 0, isLike ? 0 : -1);
        setUserReactions((prev) => ({ ...prev, [publicationId]: null }));

        const deleteQuery = user
          ? supabase
              .from("publication_likes")
              .delete()
              .eq("publication_id", publicationId)
              .eq("user_id", user.id)
          : supabase
              .from("publication_likes")
              .delete()
              .eq("publication_id", publicationId)
              .eq("guest_id", guestId);

        const { error } = await deleteQuery;
        if (error) throw error;
      } else if (currentReaction !== null && currentReaction !== undefined) {
        // Toggle from like to dislike or vice versa
        // Optimistic update: toggle reaction
        updatePublicationCounts(
          isLike ? 1 : -1,
          isLike ? -1 : 1
        );
        setUserReactions((prev) => ({ ...prev, [publicationId]: isLike }));

        const updateQuery = user
          ? supabase
              .from("publication_likes")
              .update({ is_like: isLike })
              .eq("publication_id", publicationId)
              .eq("user_id", user.id)
          : supabase
              .from("publication_likes")
              .update({ is_like: isLike })
              .eq("publication_id", publicationId)
              .eq("guest_id", guestId);

        const { error } = await updateQuery;
        if (error) throw error;
      } else {
        // New reaction
        // Optimistic update: add reaction
        updatePublicationCounts(isLike ? 1 : 0, isLike ? 0 : 1);
        setUserReactions((prev) => ({ ...prev, [publicationId]: isLike }));

        const { error } = await supabase.from("publication_likes").insert({
          publication_id: publicationId,
          user_id: user?.id || null,
          guest_id: user ? null : guestId,
          is_like: isLike,
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Revert optimistic update on error
      setUserReactions((prev) => ({ ...prev, [publicationId]: currentReaction }));
      fetchPublications(); // Re-fetch to get correct state
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    }
  };

  const addComment = async (publicationId: string, content: string) => {
    const authorName = user && profile ? profile.full_name : "Anonymous";

    try {
      const { error } = await supabase.from("publication_comments").insert({
        publication_id: publicationId,
        user_id: user?.id || null,
        author_name: authorName,
        content,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      fetchPublications();
      return { error: null };
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return { error };
    }
  };

  const fetchComments = async (publicationId: string) => {
    try {
      const { data, error } = await supabase
        .from("publication_comments")
        .select("*")
        .eq("publication_id", publicationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PublicationComment[];
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  return {
    publications,
    loading,
    userReactions,
    createPublication,
    updatePublication,
    deletePublication,
    toggleReaction,
    addComment,
    fetchComments,
    refetch: fetchPublications,
  };
}

export function useGovernmentPublications() {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPublications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("official_publications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error("Error fetching my publications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyPublications();
  }, [fetchMyPublications]);

  return {
    publications,
    loading,
    refetch: fetchMyPublications,
  };
}
