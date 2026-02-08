import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DonationCenterRow = Database["public"]["Tables"]["donation_centers"]["Row"];
type DonationCenterInsert = Database["public"]["Tables"]["donation_centers"]["Insert"];
type DonationCategoryRow = Database["public"]["Tables"]["donation_categories"]["Row"];
type DonationProductRow = Database["public"]["Tables"]["donation_products"]["Row"];

export type DonationCenter = DonationCenterRow;
export type DonationCategory = DonationCategoryRow;
export type DonationProduct = DonationProductRow;

export type DonationCenterWithDetails = DonationCenter & {
  categories: DonationCategory[];
  products: DonationProduct[];
};

export function useDonationCenters() {
  const [centers, setCenters] = useState<DonationCenter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCenters = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("donation_centers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch donation centers");
      console.error(error);
    } else {
      setCenters(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCenters();

    const channel = supabase
      .channel("donation-centers-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_centers" },
        () => fetchCenters()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { centers, loading, refetch: fetchCenters };
}

export function useDonationCenterDetails(centerId: string | null) {
  const [center, setCenter] = useState<DonationCenterWithDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!centerId) {
      setCenter(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      
      const [centerRes, categoriesRes, productsRes] = await Promise.all([
        supabase.from("donation_centers").select("*").eq("id", centerId).single(),
        supabase.from("donation_categories").select("*").eq("center_id", centerId),
        supabase.from("donation_products").select("*").eq("center_id", centerId),
      ]);

      if (centerRes.error) {
        toast.error("Failed to fetch center details");
        setLoading(false);
        return;
      }

      setCenter({
        ...centerRes.data,
        categories: categoriesRes.data || [],
        products: productsRes.data || [],
      });
      setLoading(false);
    };

    fetchDetails();

    const channel = supabase
      .channel(`center-${centerId}-details`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_categories", filter: `center_id=eq.${centerId}` },
        () => fetchDetails()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_products", filter: `center_id=eq.${centerId}` },
        () => fetchDetails()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [centerId]);

  return { center, loading };
}

export function useUserDonationCenters() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<DonationCenter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCenters = async () => {
    if (!user) {
      setCenters([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("donation_centers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch your donation centers");
      console.error(error);
    } else {
      setCenters(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCenters();

    if (!user) return;

    // Real-time subscription for user's centers
    const channel = supabase
      .channel(`user-centers-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_centers", filter: `user_id=eq.${user.id}` },
        () => fetchCenters()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createCenter = async (data: Omit<DonationCenterInsert, "user_id">) => {
    if (!user) {
      toast.error("Please sign in to create a center");
      return null;
    }

    const { data: newCenter, error } = await supabase
      .from("donation_centers")
      .insert({ ...data, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create donation center");
      console.error(error);
      return null;
    }

    toast.success("Donation center created successfully!");
    await fetchCenters();
    return newCenter;
  };

  const updateCenter = async (id: string, data: Partial<DonationCenterInsert>) => {
    const { error } = await supabase
      .from("donation_centers")
      .update(data)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update donation center");
      console.error(error);
      return false;
    }

    toast.success("Donation center updated!");
    await fetchCenters();
    return true;
  };

  const deleteCenter = async (id: string) => {
    const { error } = await supabase
      .from("donation_centers")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete donation center");
      console.error(error);
      return false;
    }

    toast.success("Donation center deleted!");
    await fetchCenters();
    return true;
  };

  return { centers, loading, createCenter, updateCenter, deleteCenter, refetch: fetchCenters };
}

// Category and Product management hooks
export function useCenterManagement(centerId: string) {
  const addCategory = async (name: string) => {
    const { data, error } = await supabase
      .from("donation_categories")
      .insert({ center_id: centerId, name })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add category");
      return null;
    }
    toast.success("Category added!");
    return data;
  };

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase
      .from("donation_categories")
      .update({ name })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update category");
      return false;
    }
    toast.success("Category updated!");
    return true;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from("donation_categories")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete category");
      return false;
    }
    toast.success("Category deleted!");
    return true;
  };

  const addProduct = async (data: { name: string; category_id?: string; current_count?: number; max_capacity?: number }) => {
    const { data: newProduct, error } = await supabase
      .from("donation_products")
      .insert({ center_id: centerId, ...data })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add product");
      return null;
    }
    toast.success("Product added!");
    return newProduct;
  };

  const updateProduct = async (id: string, data: { name?: string; category_id?: string; current_count?: number; max_capacity?: number }) => {
    const { error } = await supabase
      .from("donation_products")
      .update(data)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update product");
      return false;
    }
    toast.success("Product updated!");
    return true;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from("donation_products")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete product");
      return false;
    }
    toast.success("Product deleted!");
    return true;
  };

  return {
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}

// Comments hook
export function useDonationCenterComments(centerId: string) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Database["public"]["Tables"]["donation_center_comments"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("donation_center_comments")
      .select("*")
      .eq("center_id", centerId)
      .order("created_at", { ascending: false });

    if (!error) {
      setComments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [centerId]);

  const addComment = async (content: string) => {
    const { error } = await supabase
      .from("donation_center_comments")
      .insert({
        center_id: centerId,
        content,
        user_id: user?.id || null,
        author_name: profile?.full_name || "Anonymous",
      });

    if (error) {
      toast.error("Failed to add comment");
      return false;
    }
    toast.success("Comment added!");
    await fetchComments();
    return true;
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase
      .from("donation_center_comments")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete comment");
      return false;
    }
    await fetchComments();
    return true;
  };

  return { comments, loading, addComment, deleteComment };
}

// Likes hook with real-time count updates
export function useDonationCenterLikes(centerId: string) {
  const { user } = useAuth();
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const guestId = typeof window !== "undefined" 
    ? localStorage.getItem("guest_id") || (() => {
        const id = crypto.randomUUID();
        localStorage.setItem("guest_id", id);
        return id;
      })()
    : null;

  const fetchCounts = async () => {
    const { data } = await supabase
      .from("donation_centers")
      .select("likes_count, dislikes_count")
      .eq("id", centerId)
      .single();
    
    if (data) {
      setLikesCount(data.likes_count);
      setDislikesCount(data.dislikes_count);
    }
  };

  const fetchUserReaction = async () => {
    const query = user?.id
      ? supabase.from("donation_center_likes").select("is_like").eq("center_id", centerId).eq("user_id", user.id).maybeSingle()
      : supabase.from("donation_center_likes").select("is_like").eq("center_id", centerId).eq("guest_id", guestId).maybeSingle();

    const { data } = await query;
    setUserReaction(data ? (data.is_like ? "like" : "dislike") : null);
    setLoading(false);
  };

  useEffect(() => {
    if (!centerId) return;
    fetchUserReaction();
    fetchCounts();

    // Real-time subscription for likes count
    const channel = supabase
      .channel(`center-likes-${centerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_center_likes", filter: `center_id=eq.${centerId}` },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [centerId, user]);

  const toggleReaction = async (isLike: boolean) => {
    const prevReaction = userReaction;
    const prevLikes = likesCount;
    const prevDislikes = dislikesCount;

    // Optimistic update
    if (userReaction === (isLike ? "like" : "dislike")) {
      setUserReaction(null);
      if (isLike) setLikesCount(prev => Math.max(0, prev - 1));
      else setDislikesCount(prev => Math.max(0, prev - 1));
    } else if (userReaction) {
      setUserReaction(isLike ? "like" : "dislike");
      if (isLike) {
        setLikesCount(prev => prev + 1);
        setDislikesCount(prev => Math.max(0, prev - 1));
      } else {
        setDislikesCount(prev => prev + 1);
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    } else {
      setUserReaction(isLike ? "like" : "dislike");
      if (isLike) setLikesCount(prev => prev + 1);
      else setDislikesCount(prev => prev + 1);
    }

    try {
      if (prevReaction === (isLike ? "like" : "dislike")) {
        // Remove reaction
        const query = user?.id
          ? supabase.from("donation_center_likes").delete().eq("center_id", centerId).eq("user_id", user.id)
          : supabase.from("donation_center_likes").delete().eq("center_id", centerId).eq("guest_id", guestId);
        await query;
      } else if (prevReaction) {
        // Update reaction
        const deleteQuery = user?.id
          ? supabase.from("donation_center_likes").delete().eq("center_id", centerId).eq("user_id", user.id)
          : supabase.from("donation_center_likes").delete().eq("center_id", centerId).eq("guest_id", guestId);
        await deleteQuery;
        
        await supabase.from("donation_center_likes").insert({
          center_id: centerId,
          user_id: user?.id || null,
          guest_id: user ? null : guestId,
          is_like: isLike,
        });
      } else {
        // Add new reaction
        await supabase.from("donation_center_likes").insert({
          center_id: centerId,
          user_id: user?.id || null,
          guest_id: user ? null : guestId,
          is_like: isLike,
        });
      }
    } catch (error) {
      // Rollback on error
      setUserReaction(prevReaction);
      setLikesCount(prevLikes);
      setDislikesCount(prevDislikes);
    }
  };

  return { userReaction, likesCount, dislikesCount, loading, toggleReaction };
}
