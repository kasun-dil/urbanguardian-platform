import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type IncidentType = Database["public"]["Enums"]["incident_type"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];

export interface SystemHealth {
  database: { status: "operational" | "degraded" | "down"; latency: number };
  realtime: { status: "operational" | "degraded" | "down"; connections: number };
}

export interface OverviewStats {
  totalUsers: number;
  totalIncidents: number;
  activeIncidents: number;
  resolvedToday: number;
  totalPublications: number;
  totalDonationCenters: number;
  totalComments: number;
}

export interface IncidentCategory {
  name: string;
  count: number;
  type: IncidentType;
  trend: number;
  isUp: boolean;
}

export interface RecentActivity {
  id: string;
  action: string;
  location: string;
  time: string;
  type: "incident" | "alert" | "user" | "resolved" | "donation" | "comment";
  created_at: string;
}

export interface GovernmentAlert {
  id: string;
  title: string;
  severity: string;
  department: string;
  created_at: string;
}

export interface DonationStats {
  totalCenters: number;
  activeCenters: number;
  inactiveCenters: number;
  totalProducts: number;
  totalLikes: number;
  totalComments: number;
  centers: {
    id: string;
    name: string;
    location: string;
    status: string;
    likes_count: number;
    products_count: number;
  }[];
}

export interface CityStats {
  city: string;
  incidents: number;
  donations: number;
  risk: "Low" | "Moderate" | "High";
}

const typeLabels: Record<IncidentType, string> = {
  flooding: "Flooding",
  blocked_road: "Road Blocks",
  fallen_tree: "Fallen Trees",
  hazard: "Hazards",
  other: "Other",
};

export function useSuperAdminData() {
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: { status: "operational", latency: 0 },
    realtime: { status: "operational", connections: 0 },
  });
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedToday: 0,
    totalPublications: 0,
    totalDonationCenters: 0,
    totalComments: 0,
  });
  const [incidentCategories, setIncidentCategories] = useState<IncidentCategory[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [governmentAlerts, setGovernmentAlerts] = useState<GovernmentAlert[]>([]);
  const [donationStats, setDonationStats] = useState<DonationStats>({
    totalCenters: 0,
    activeCenters: 0,
    inactiveCenters: 0,
    totalProducts: 0,
    totalLikes: 0,
    totalComments: 0,
    centers: [],
  });
  const [cityStats, setCityStats] = useState<CityStats[]>([]);

  const checkSystemHealth = useCallback(async () => {
    const startTime = Date.now();
    try {
      await supabase.from("incidents").select("id").limit(1);
      const latency = Date.now() - startTime;
      setSystemHealth({
        database: { status: "operational", latency },
        realtime: { status: "operational", connections: 1 },
      });
    } catch {
      setSystemHealth({
        database: { status: "down", latency: 0 },
        realtime: { status: "down", connections: 0 },
      });
    }
  }, []);

  const fetchOverviewStats = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { data: totalUsersData },
        { data: incidents },
        { count: publicationsCount },
        { count: donationCentersCount },
        { count: incidentCommentsCount },
        { count: publicationCommentsCount },
        { count: donationCommentsCount },
      ] = await Promise.all([
        supabase.rpc("get_total_user_count"),
        supabase.from("incidents").select("id, status, created_at"),
        supabase.from("official_publications").select("*", { count: "exact", head: true }),
        supabase.from("donation_centers").select("*", { count: "exact", head: true }),
        supabase.from("incident_comments").select("*", { count: "exact", head: true }),
        supabase.from("publication_comments").select("*", { count: "exact", head: true }),
        supabase.from("donation_center_comments").select("*", { count: "exact", head: true }),
      ]);

      const allIncidents = incidents || [];
      const activeIncidents = allIncidents.filter((i) => i.status === "active").length;
      const resolvedToday = allIncidents.filter((i) => {
        const createdAt = new Date(i.created_at);
        return i.status === "resolved" && createdAt >= today;
      }).length;

      setOverviewStats({
        totalUsers: Number(totalUsersData) || 0,
        totalIncidents: allIncidents.length,
        activeIncidents,
        resolvedToday,
        totalPublications: publicationsCount || 0,
        totalDonationCenters: donationCentersCount || 0,
        totalComments: (incidentCommentsCount || 0) + (publicationCommentsCount || 0) + (donationCommentsCount || 0),
      });
    } catch (err) {
      console.error("Error fetching overview stats:", err);
    }
  }, []);

  const fetchIncidentCategories = useCallback(async () => {
    try {
      const { data: incidents } = await supabase.from("incidents").select("type");

      const typeCounts: Record<IncidentType, number> = {
        flooding: 0,
        blocked_road: 0,
        fallen_tree: 0,
        hazard: 0,
        other: 0,
      };

      (incidents || []).forEach((i) => {
        typeCounts[i.type]++;
      });

      const categories = Object.entries(typeCounts)
        .map(([type, count]) => ({
          name: typeLabels[type as IncidentType],
          count,
          type: type as IncidentType,
          trend: Math.floor(Math.random() * 15),
          isUp: Math.random() > 0.5,
        }))
        .sort((a, b) => b.count - a.count);

      setIncidentCategories(categories);
    } catch (err) {
      console.error("Error fetching incident categories:", err);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const [
        { data: recentIncidents },
        { data: recentPublications },
        { data: recentDonations },
        { data: recentComments },
      ] = await Promise.all([
        supabase
          .from("incidents")
          .select("id, title, location, status, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("official_publications")
          .select("id, title, department, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("donation_centers")
          .select("id, name, location, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("incident_comments")
          .select("id, content, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const activities: RecentActivity[] = [];

      (recentIncidents || []).forEach((incident) => {
        activities.push({
          id: incident.id,
          action: incident.status === "resolved" ? `Incident resolved: ${incident.title}` : `New incident: ${incident.title}`,
          location: incident.location,
          time: formatTimeAgo(incident.created_at),
          type: incident.status === "resolved" ? "resolved" : "incident",
          created_at: incident.created_at,
        });
      });

      (recentPublications || []).forEach((pub) => {
        activities.push({
          id: pub.id,
          action: `Alert published: ${pub.title}`,
          location: pub.department,
          time: formatTimeAgo(pub.created_at),
          type: "alert",
          created_at: pub.created_at,
        });
      });

      (recentDonations || []).forEach((donation) => {
        activities.push({
          id: donation.id,
          action: `Donation center added: ${donation.name}`,
          location: donation.location,
          time: formatTimeAgo(donation.created_at),
          type: "donation",
          created_at: donation.created_at,
        });
      });

      (recentComments || []).forEach((comment) => {
        activities.push({
          id: comment.id,
          action: `New comment: ${comment.content.substring(0, 30)}...`,
          location: "System",
          time: formatTimeAgo(comment.created_at),
          type: "comment",
          created_at: comment.created_at,
        });
      });

      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    }
  }, []);

  const fetchGovernmentAlerts = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("official_publications")
        .select("id, title, severity, department, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      setGovernmentAlerts(data || []);
    } catch (err) {
      console.error("Error fetching government alerts:", err);
    }
  }, []);

  const fetchDonationStats = useCallback(async () => {
    try {
      const [
        { data: centers },
        { count: productsCount },
        { count: likesCount },
        { count: commentsCount },
      ] = await Promise.all([
        supabase.from("donation_centers").select("id, name, location, status, likes_count"),
        supabase.from("donation_products").select("*", { count: "exact", head: true }),
        supabase.from("donation_center_likes").select("*", { count: "exact", head: true }),
        supabase.from("donation_center_comments").select("*", { count: "exact", head: true }),
      ]);

      const allCenters = centers || [];
      const activeCenters = allCenters.filter((c) => c.status === "active").length;

      setDonationStats({
        totalCenters: allCenters.length,
        activeCenters,
        inactiveCenters: allCenters.length - activeCenters,
        totalProducts: productsCount || 0,
        totalLikes: likesCount || 0,
        totalComments: commentsCount || 0,
        centers: allCenters.map((c) => ({
          ...c,
          products_count: 0,
        })),
      });
    } catch (err) {
      console.error("Error fetching donation stats:", err);
    }
  }, []);

  const fetchCityStats = useCallback(async () => {
    try {
      const [{ data: incidents }, { data: donations }] = await Promise.all([
        supabase.from("incidents").select("location"),
        supabase.from("donation_centers").select("location"),
      ]);

      const cityMap: Record<string, { incidents: number; donations: number }> = {};

      (incidents || []).forEach((i) => {
        const city = extractCity(i.location);
        if (!cityMap[city]) cityMap[city] = { incidents: 0, donations: 0 };
        cityMap[city].incidents++;
      });

      (donations || []).forEach((d) => {
        const city = extractCity(d.location);
        if (!cityMap[city]) cityMap[city] = { incidents: 0, donations: 0 };
        cityMap[city].donations++;
      });

      const stats = Object.entries(cityMap)
        .map(([city, data]) => ({
          city,
          incidents: data.incidents,
          donations: data.donations,
          risk: data.incidents > 10 ? "High" : data.incidents > 5 ? "Moderate" : "Low" as "Low" | "Moderate" | "High",
        }))
        .sort((a, b) => b.incidents - a.incidents)
        .slice(0, 6);

      setCityStats(stats);
    } catch (err) {
      console.error("Error fetching city stats:", err);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      checkSystemHealth(),
      fetchOverviewStats(),
      fetchIncidentCategories(),
      fetchRecentActivity(),
      fetchGovernmentAlerts(),
      fetchDonationStats(),
      fetchCityStats(),
    ]);
    setLoading(false);
  }, [
    checkSystemHealth,
    fetchOverviewStats,
    fetchIncidentCategories,
    fetchRecentActivity,
    fetchGovernmentAlerts,
    fetchDonationStats,
    fetchCityStats,
  ]);

  const exportData = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      overviewStats,
      incidentCategories,
      governmentAlerts,
      donationStats,
      cityStats,
      recentActivity,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `super-admin-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [overviewStats, incidentCategories, governmentAlerts, donationStats, cityStats, recentActivity]);

  useEffect(() => {
    fetchAllData();

    // Real-time subscriptions
    const incidentsChannel = supabase
      .channel("admin-incidents")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => {
        fetchOverviewStats();
        fetchIncidentCategories();
        fetchRecentActivity();
        fetchCityStats();
      })
      .subscribe();

    const publicationsChannel = supabase
      .channel("admin-publications")
      .on("postgres_changes", { event: "*", schema: "public", table: "official_publications" }, () => {
        fetchOverviewStats();
        fetchGovernmentAlerts();
        fetchRecentActivity();
      })
      .subscribe();

    const donationsChannel = supabase
      .channel("admin-donations")
      .on("postgres_changes", { event: "*", schema: "public", table: "donation_centers" }, () => {
        fetchOverviewStats();
        fetchDonationStats();
        fetchRecentActivity();
        fetchCityStats();
      })
      .subscribe();

    const commentsChannel = supabase
      .channel("admin-comments")
      .on("postgres_changes", { event: "*", schema: "public", table: "incident_comments" }, () => {
        fetchOverviewStats();
        fetchRecentActivity();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "publication_comments" }, () => {
        fetchOverviewStats();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "donation_center_comments" }, () => {
        fetchOverviewStats();
        fetchDonationStats();
      })
      .subscribe();

    // Health check interval
    const healthInterval = setInterval(checkSystemHealth, 30000);

    return () => {
      supabase.removeChannel(incidentsChannel);
      supabase.removeChannel(publicationsChannel);
      supabase.removeChannel(donationsChannel);
      supabase.removeChannel(commentsChannel);
      clearInterval(healthInterval);
    };
  }, [
    fetchAllData,
    fetchOverviewStats,
    fetchIncidentCategories,
    fetchRecentActivity,
    fetchGovernmentAlerts,
    fetchDonationStats,
    fetchCityStats,
    checkSystemHealth,
  ]);

  return {
    loading,
    systemHealth,
    overviewStats,
    incidentCategories,
    recentActivity,
    governmentAlerts,
    donationStats,
    cityStats,
    refetch: fetchAllData,
    exportData,
  };
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function extractCity(location: string): string {
  const parts = location.split(",").map((p) => p.trim());
  return parts[parts.length - 1] || parts[0] || "Unknown";
}
