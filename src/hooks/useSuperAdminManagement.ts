import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type IncidentType = Database["public"]["Enums"]["incident_type"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];
type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];
type DonationCenterStatus = Database["public"]["Enums"]["donation_center_status"];
type PublicationSeverity = Database["public"]["Enums"]["publication_severity"];
type PublicationAlertType = Database["public"]["Enums"]["publication_alert_type"];
type AppRole = Database["public"]["Enums"]["app_role"];

export interface IncidentRecord {
  id: string;
  title: string;
  type: IncidentType;
  status: IncidentStatus;
  severity: IncidentSeverity;
  location: string;
  latitude: number;
  longitude: number;
  description: string | null;
  reported_by: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface DonationCenterRecord {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string | null;
  status: DonationCenterStatus;
  phone_numbers: string[];
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  is_admin_verified: boolean;
  is_government_verified: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface PublicationRecord {
  id: string;
  title: string;
  alert_type: PublicationAlertType;
  severity: PublicationSeverity;
  department: string;
  description: string;
  forecast_info: string | null;
  recommendations: string[];
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface UserRecord {
  id: string;
  user_id: string;
  full_name: string;
  role: AppRole;
  created_at: string;
  email?: string;
}

export function useSuperAdminManagement() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [donationCenters, setDonationCenters] = useState<DonationCenterRecord[]>([]);
  const [publications, setPublications] = useState<PublicationRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoadingIncidents(true);
    try {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      toast.error("Failed to load incidents");
    } finally {
      setLoadingIncidents(false);
    }
  }, []);

  const fetchDonationCenters = useCallback(async () => {
    setLoadingDonations(true);
    try {
      const { data, error } = await supabase
        .from("donation_centers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDonationCenters(data || []);
    } catch (err) {
      console.error("Error fetching donation centers:", err);
      toast.error("Failed to load donation centers");
    } finally {
      setLoadingDonations(false);
    }
  }, []);

  const fetchPublications = useCallback(async () => {
    setLoadingPublications(true);
    try {
      const { data, error } = await supabase
        .from("official_publications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (err) {
      console.error("Error fetching publications:", err);
      toast.error("Failed to load publications");
    } finally {
      setLoadingPublications(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, created_at");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);
      
      const usersData: UserRecord[] = (profiles || []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        full_name: p.full_name,
        role: roleMap.get(p.user_id) || "citizen",
        created_at: p.created_at,
      }));

      // Filter out super_admins and organizations for the user list
      const filteredUsers = usersData.filter(
        (u) => u.role === "citizen" || u.role === "government"
      );

      setUsers(filteredUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const deleteIncident = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      // Delete related likes and comments first
      await supabase.from("incident_likes").delete().eq("incident_id", id);
      await supabase.from("incident_comments").delete().eq("incident_id", id);
      
      const { error } = await supabase.from("incidents").delete().eq("id", id);
      if (error) throw error;
      
      setIncidents((prev) => prev.filter((i) => i.id !== id));
      toast.success("Incident deleted successfully");
    } catch (err) {
      console.error("Error deleting incident:", err);
      toast.error("Failed to delete incident");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const deleteDonationCenter = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      // Delete related data first
      await supabase.from("donation_center_likes").delete().eq("center_id", id);
      await supabase.from("donation_center_comments").delete().eq("center_id", id);
      await supabase.from("donation_products").delete().eq("center_id", id);
      await supabase.from("donation_categories").delete().eq("center_id", id);
      
      const { error } = await supabase.from("donation_centers").delete().eq("id", id);
      if (error) throw error;
      
      setDonationCenters((prev) => prev.filter((c) => c.id !== id));
      toast.success("Donation center deleted successfully");
    } catch (err) {
      console.error("Error deleting donation center:", err);
      toast.error("Failed to delete donation center");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const deletePublication = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      // Delete related likes and comments first
      await supabase.from("publication_likes").delete().eq("publication_id", id);
      await supabase.from("publication_comments").delete().eq("publication_id", id);
      
      const { error } = await supabase.from("official_publications").delete().eq("id", id);
      if (error) throw error;
      
      setPublications((prev) => prev.filter((p) => p.id !== id));
      toast.success("Publication deleted successfully");
    } catch (err) {
      console.error("Error deleting publication:", err);
      toast.error("Failed to delete publication");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    setDeletingId(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing backend configuration");
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      toast.success("User deleted successfully");
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchDonationCenters();
    fetchPublications();
    fetchUsers();
  }, [fetchIncidents, fetchDonationCenters, fetchPublications, fetchUsers]);

  return {
    incidents,
    donationCenters,
    publications,
    users,
    loadingIncidents,
    loadingDonations,
    loadingPublications,
    loadingUsers,
    deletingId,
    fetchIncidents,
    fetchDonationCenters,
    fetchPublications,
    fetchUsers,
    deleteIncident,
    deleteDonationCenter,
    deletePublication,
    deleteUser,
  };
}
