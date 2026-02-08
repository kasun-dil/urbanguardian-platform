import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: "flooding" | "blocked_road" | "fallen_tree" | "hazard" | "weather" | "alert" | "other";
  title: string;
  description?: string;
  severity?: "low" | "moderate" | "high" | "critical";
}

interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
  showRiskZones?: boolean;
}

const markerColors: Record<string, string> = {
  flooding: "#3B82F6", // primary blue
  blocked_road: "#F59E0B", // warning yellow
  fallen_tree: "#22C55E", // safe green
  hazard: "#EF4444", // danger red
  weather: "#8B5CF6", // purple
  alert: "#F97316", // orange
  other: "#6B7280", // gray
};

const severityColors: Record<string, string> = {
  low: "#22C55E",
  moderate: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
};

const createCustomIcon = (type: string, severity?: string) => {
  const color = severity ? severityColors[severity] : markerColors[type] || markerColors.other;
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export function InteractiveMap({
  center = [6.9271, 79.8612], // Default: Colombo, Sri Lanka
  zoom = 13,
  markers = [],
  onMarkerClick,
  className = "",
  showRiskZones = false,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Add dark-themed tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Create markers layer
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Add risk zones if enabled
    if (showRiskZones) {
      // Example flood risk zone
      L.circle([6.9271, 79.8612], {
        color: "#3B82F6",
        fillColor: "#3B82F6",
        fillOpacity: 0.15,
        radius: 1500,
        weight: 2,
      }).addTo(map).bindPopup("<strong>Flood Risk Zone</strong><br/>Low-lying coastal area");

      // Example weather risk zone
      L.circle([6.9147, 79.8619], {
        color: "#F59E0B",
        fillColor: "#F59E0B",
        fillOpacity: 0.15,
        radius: 800,
        weight: 2,
      }).addTo(map).bindPopup("<strong>Weather Advisory Zone</strong><br/>Heavy rainfall expected");
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom, showRiskZones]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach((marker) => {
      const icon = createCustomIcon(marker.type, marker.severity);
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong style="font-size: 14px;">${marker.title}</strong>
            ${marker.description ? `<p style="margin: 8px 0 0; font-size: 12px; color: #666;">${marker.description}</p>` : ""}
            ${marker.severity ? `<span style="display: inline-block; margin-top: 8px; padding: 2px 8px; background: ${severityColors[marker.severity]}; color: white; border-radius: 4px; font-size: 11px; text-transform: uppercase;">${marker.severity}</span>` : ""}
          </div>
        `);

      if (onMarkerClick) {
        leafletMarker.on("click", () => onMarkerClick(marker));
      }

      markersLayerRef.current?.addLayer(leafletMarker);
    });
  }, [markers, onMarkerClick]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full min-h-[400px] ${className}`}
      style={{ background: "#1a1a2e" }}
    />
  );
}
