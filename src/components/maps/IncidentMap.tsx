import { useMemo } from "react";
import { InteractiveMap, MapMarker } from "./InteractiveMap";
import type { Incident } from "@/hooks/useIncidents";

interface IncidentMapProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
}

export function IncidentMap({ incidents, onIncidentClick, className }: IncidentMapProps) {
  const markers: MapMarker[] = useMemo(() => {
    return incidents
      .filter((incident) => incident.status !== "resolved")
      .map((incident) => {
        const severityMap: Record<string, "low" | "moderate" | "high" | "critical"> = {
          low: "low",
          moderate: "moderate",
          high: "high",
          critical: "critical",
        };

        return {
          id: incident.id,
          lat: incident.latitude,
          lng: incident.longitude,
          type: incident.type,
          title: incident.title,
          description: incident.description || undefined,
          severity: severityMap[incident.severity] || "moderate",
        };
      });
  }, [incidents]);

  const handleMarkerClick = (marker: MapMarker) => {
    if (onIncidentClick) {
      const incident = incidents.find((i) => i.id === marker.id);
      if (incident) {
        onIncidentClick(incident);
      }
    }
  };

  return (
    <InteractiveMap
      markers={markers}
      onMarkerClick={handleMarkerClick}
      className={className}
      center={[6.9271, 79.8612]}
      zoom={13}
    />
  );
}
