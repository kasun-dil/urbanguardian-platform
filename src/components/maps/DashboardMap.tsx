import { useMemo } from "react";
import { InteractiveMap, MapMarker } from "./InteractiveMap";

interface Alert {
  id: number;
  type: string;
  title: string;
  description: string;
  risk: string;
  coordinates?: { lat: number; lng: number };
}

interface DashboardMapProps {
  alerts?: Alert[];
  showRiskZones?: boolean;
  className?: string;
}

export function DashboardMap({ alerts = [], showRiskZones = true, className }: DashboardMapProps) {
  const markers: MapMarker[] = useMemo(() => {
    // Default alert markers for the dashboard
    const defaultMarkers: MapMarker[] = [
      {
        id: "weather-1",
        lat: 6.9271,
        lng: 79.8612,
        type: "weather",
        title: "Heavy Rain Warning",
        description: "Expected heavy rainfall in the next 6 hours",
        severity: "moderate",
      },
      {
        id: "flood-1",
        lat: 6.8844,
        lng: 79.8571,
        type: "flooding",
        title: "Flash Flood Watch",
        description: "Low-lying areas may experience flooding",
        severity: "high",
      },
      {
        id: "alert-1",
        lat: 6.9147,
        lng: 79.8619,
        type: "alert",
        title: "Traffic Advisory",
        description: "Multiple road closures due to weather",
        severity: "low",
      },
    ];

    // Add any custom alerts passed as props
    const customMarkers = alerts
      .filter((alert) => alert.coordinates)
      .map((alert) => ({
        id: `alert-${alert.id}`,
        lat: alert.coordinates!.lat,
        lng: alert.coordinates!.lng,
        type: "alert" as const,
        title: alert.title,
        description: alert.description,
        severity: alert.risk === "high" ? "high" as const : "moderate" as const,
      }));

    return [...defaultMarkers, ...customMarkers];
  }, [alerts]);

  return (
    <InteractiveMap
      markers={markers}
      showRiskZones={showRiskZones}
      className={className}
      center={[6.9271, 79.8612]}
      zoom={12}
    />
  );
}
