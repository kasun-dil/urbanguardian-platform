import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type IncidentType = Database["public"]["Enums"]["incident_type"];
type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];
type PublicationSeverity = Database["public"]["Enums"]["publication_severity"];
type PublicationAlertType = Database["public"]["Enums"]["publication_alert_type"];

export interface DashboardAlert {
  id: string;
  type: PublicationAlertType;
  title: string;
  description: string;
  severity: PublicationSeverity;
  department: string;
  created_at: string;
}

export interface IncidentStats {
  total: number;
  resolved: number;
  active: number;
  investigating: number;
  categories: {
    name: string;
    count: number;
    type: IncidentType;
  }[];
}

export function useDashboardAlerts() {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("official_publications")
        .select("id, alert_type, title, description, severity, department, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setAlerts(
        (data || []).map((pub) => ({
          id: pub.id,
          type: pub.alert_type,
          title: pub.title,
          description: pub.description,
          severity: pub.severity,
          department: pub.department,
          created_at: pub.created_at,
        }))
      );
    } catch (err) {
      console.error("Error fetching dashboard alerts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    // Real-time subscription
    const channel = supabase
      .channel("dashboard-alerts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "official_publications" },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  return { alerts, loading, refetch: fetchAlerts };
}

export function useDashboardIncidents() {
  const [stats, setStats] = useState<IncidentStats>({
    total: 0,
    resolved: 0,
    active: 0,
    investigating: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("incidents")
        .select("id, type, status");

      if (error) throw error;

      const incidents = data || [];
      const total = incidents.length;
      const resolved = incidents.filter((i) => i.status === "resolved").length;
      const active = incidents.filter((i) => i.status === "active").length;
      const investigating = incidents.filter((i) => i.status === "investigating").length;

      // Count by type
      const typeCounts: Record<IncidentType, number> = {
        flooding: 0,
        blocked_road: 0,
        fallen_tree: 0,
        hazard: 0,
        other: 0,
      };

      incidents.forEach((i) => {
        typeCounts[i.type]++;
      });

      const typeLabels: Record<IncidentType, string> = {
        flooding: "Flooding",
        blocked_road: "Road Blocks",
        fallen_tree: "Fallen Trees",
        hazard: "Hazards",
        other: "Other",
      };

      const categories = Object.entries(typeCounts)
        .map(([type, count]) => ({
          name: typeLabels[type as IncidentType],
          count,
          type: type as IncidentType,
        }))
        .sort((a, b) => b.count - a.count);

      setStats({ total, resolved, active, investigating, categories });
    } catch (err) {
      console.error("Error fetching incident stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Real-time subscription
    const channel = supabase
      .channel("dashboard-incidents-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
