import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Layers, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// NASA GIBS WMTS Layer configurations
const GIBS_LAYERS = {
  VIIRS_SNPP_CorrectedReflectance_TrueColor: {
    name: "VIIRS True Color",
    description: "Daily satellite imagery",
    format: "jpg",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
  },
  MODIS_Terra_CorrectedReflectance_TrueColor: {
    name: "MODIS Terra True Color",
    description: "Terra satellite daily imagery",
    format: "jpg",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
  },
  VIIRS_NOAA20_CorrectedReflectance_TrueColor: {
    name: "VIIRS NOAA-20 True Color",
    description: "NOAA-20 satellite daily imagery",
    format: "jpg",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
  },
  VIIRS_SNPP_DayNightBand_ENCC: {
    name: "Day/Night Band",
    description: "Night lights and cloud illumination",
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level8",
  },
  MODIS_Combined_Flood_2Day: {
    name: "Flood Detection (2-Day)",
    description: "Near real-time flood detection",
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level8",
  },
  VIIRS_SNPP_Thermal_Anomalies_375m_All: {
    name: "Thermal Anomalies (Fires)",
    description: "Active fire detection",
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level8",
  },
} as const;

type GIBSLayerKey = keyof typeof GIBS_LAYERS;

interface NASAGIBSMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  onLocationChange?: (lat: number, lng: number) => void;
}

// Get yesterday's date for GIBS (most recent complete data)
function getGIBSDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

export function NASAGIBSMap({
  center = [6.9271, 79.8612],
  zoom = 8,
  className = "",
  onLocationChange,
}: NASAGIBSMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const gibsLayerRef = useRef<L.TileLayer | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  
  const [activeLayer, setActiveLayer] = useState<GIBSLayerKey>("VIIRS_SNPP_CorrectedReflectance_TrueColor");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showBaseMap, setShowBaseMap] = useState(true);

  // Create GIBS tile URL
  const createGIBSTileUrl = useCallback((layerKey: GIBSLayerKey) => {
    const layer = GIBS_LAYERS[layerKey];
    const date = getGIBSDate();
    return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerKey}/default/${date}/${layer.tileMatrixSet}/{z}/{y}/{x}.${layer.format}`;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Base layer (dark map for context)
    baseLayerRef.current = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
        opacity: 0.5,
      }
    ).addTo(map);

    // NASA GIBS layer
    gibsLayerRef.current = L.tileLayer(createGIBSTileUrl(activeLayer), {
      attribution: 'Imagery: <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>',
      maxZoom: 9,
      tileSize: 256,
      opacity: 1,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Click handler for location selection
    map.on("click", (e: L.LeafletMouseEvent) => {
      onLocationChange?.(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
    }
  }, [center]);

  // Update GIBS layer when selection changes
  useEffect(() => {
    if (mapInstanceRef.current && gibsLayerRef.current) {
      gibsLayerRef.current.setUrl(createGIBSTileUrl(activeLayer));
    }
  }, [activeLayer, createGIBSTileUrl]);

  // Toggle base map visibility
  useEffect(() => {
    if (baseLayerRef.current) {
      baseLayerRef.current.setOpacity(showBaseMap ? 0.5 : 0);
    }
  }, [showBaseMap]);

  // Search location
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            "User-Agent": "DisasterManagementApp/1.0",
          },
        }
      );

      if (response.ok) {
        const results = await response.json();
        if (results.length > 0) {
          const { lat, lon } = results[0];
          const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
          mapInstanceRef.current.setView(newCenter, 10);
          onLocationChange?.(newCenter[0], newCenter[1]);
        }
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Controls overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
        {/* Search */}
        <div className="flex-1 flex gap-2 max-w-md">
          <Input
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-background/90 backdrop-blur-sm border-border"
          />
          <Button
            size="icon"
            variant="secondary"
            onClick={handleSearch}
            disabled={searching}
            className="bg-background/90 backdrop-blur-sm"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Layer selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/90 backdrop-blur-sm"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>NASA Satellite Layers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.entries(GIBS_LAYERS) as [GIBSLayerKey, typeof GIBS_LAYERS[GIBSLayerKey]][]).map(
              ([key, layer]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setActiveLayer(key)}
                  className={activeLayer === key ? "bg-accent" : ""}
                >
                  <div>
                    <p className="font-medium">{layer.name}</p>
                    <p className="text-xs text-muted-foreground">{layer.description}</p>
                  </div>
                </DropdownMenuItem>
              )
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowBaseMap(!showBaseMap)}>
              {showBaseMap ? "Hide" : "Show"} base map overlay
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Layer info badge */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border">
        <p className="text-xs font-medium">{GIBS_LAYERS[activeLayer].name}</p>
        <p className="text-xs text-muted-foreground">Date: {getGIBSDate()}</p>
      </div>

      <div
        ref={mapRef}
        className="w-full h-full min-h-[400px]"
        style={{ background: "#0a0a1a" }}
      />
    </div>
  );
}
