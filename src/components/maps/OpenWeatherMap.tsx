import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Layers, Loader2, Crosshair } from "lucide-react";
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

// Available weather overlay layers (OpenWeatherMap 1.0 API - free tier)
const WEATHER_LAYERS = {
  precipitation_new: { name: "Precipitation", description: "Rain and snow" },
  temp_new: { name: "Temperature", description: "Air temperature" },
  clouds_new: { name: "Clouds", description: "Cloud coverage" },
  wind_new: { name: "Wind Speed", description: "Wind speed" },
  pressure_new: { name: "Pressure", description: "Atmospheric pressure" },
} as const;

type WeatherLayerKey = keyof typeof WEATHER_LAYERS;

interface OpenWeatherMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  onLocationChange?: (lat: number, lng: number, cityName?: string) => void;
}

// Use OpenWeatherMap 1.0 tile API (free tier, direct access)
const OWM_API_KEY = "c3f0ef793c9f8056e0a1700c32651fab";

function getTileUrl(layer: WeatherLayerKey): string {
  return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`;
}

export function OpenWeatherMap({
  center = [6.9271, 79.8612],
  zoom = 7,
  className = "",
  onLocationChange,
}: OpenWeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const weatherLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<WeatherLayerKey>("precipitation_new");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Reverse geocode to get city name
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "User-Agent": "UrbanPulseApp/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        return (
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.municipality ||
          data.address?.county ||
          "Unknown"
        );
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    }
    return "Unknown";
  }, []);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark base layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 18,
    }).addTo(map);

    // Weather overlay layer via proxy
    weatherLayerRef.current = L.tileLayer(getTileUrl(activeLayer), {
      attribution: '<a href="https://openweathermap.org/">OpenWeatherMap</a>',
      opacity: 0.7,
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Click handler to change location
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Move/create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      const city = await reverseGeocode(lat, lng);
      onLocationChange?.(lat, lng, city);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLatLng(center);
      }
    }
  }, [center]);

  // Swap weather layer
  useEffect(() => {
    if (mapInstanceRef.current && weatherLayerRef.current) {
      weatherLayerRef.current.setUrl(getTileUrl(activeLayer));
    }
  }, [activeLayer]);

  // Search for location
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "User-Agent": "UrbanPulseApp/1.0" } }
      );
      if (res.ok) {
        const results = await res.json();
        if (results.length > 0) {
          const { lat, lon, display_name } = results[0];
          const latNum = parseFloat(lat);
          const lngNum = parseFloat(lon);
          mapInstanceRef.current.setView([latNum, lngNum], 10);

          if (markerRef.current) {
            markerRef.current.setLatLng([latNum, lngNum]);
          } else {
            markerRef.current = L.marker([latNum, lngNum]).addTo(mapInstanceRef.current);
          }

          const cityName = display_name.split(",")[0];
          onLocationChange?.(latNum, lngNum, cityName);
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
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Layer selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="bg-background/90 backdrop-blur-sm">
              <Layers className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Weather Layers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.entries(WEATHER_LAYERS) as [WeatherLayerKey, (typeof WEATHER_LAYERS)[WeatherLayerKey]][]).map(
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Layer info badge */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs font-medium">{WEATHER_LAYERS[activeLayer].name}</p>
          <p className="text-[10px] text-muted-foreground">Click map to select location</p>
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-full h-full min-h-[400px]"
        style={{ background: "#0a0a1a" }}
      />
    </div>
  );
}
