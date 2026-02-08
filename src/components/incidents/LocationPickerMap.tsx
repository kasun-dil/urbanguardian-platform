import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, Loader2, X } from "lucide-react";

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

interface LocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

// Custom draggable marker icon
const createDraggableIcon = () => {
  return L.divIcon({
    className: "custom-draggable-marker",
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8));
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

// Reverse geocode using Nominatim
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "UrbanPulse-App/1.0",
        },
      }
    );
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

// Forward geocode using Nominatim
interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function forwardGeocode(query: string): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8`,
      {
        headers: {
          "User-Agent": "UrbanPulse-App/1.0",
        },
      }
    );
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return [];
  }
}

export function LocationPickerMap({
  initialLat = 6.9271,
  initialLng = 79.8612,
  onLocationChange,
}: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: true,
    });

    // Add dark-themed tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Create draggable marker
    const marker = L.marker([initialLat, initialLng], {
      icon: createDraggableIcon(),
      draggable: true,
    }).addTo(map);

    // Handle marker drag events
    marker.on("dragstart", () => {
      setIsDragging(true);
    });

    marker.on("dragend", async () => {
      setIsDragging(false);
      const position = marker.getLatLng();
      const address = await reverseGeocode(position.lat, position.lng);
      onLocationChange(position.lat, position.lng, address || undefined);
    });

    // Handle map click to move marker
    map.on("click", async (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      const address = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      onLocationChange(e.latlng.lat, e.latlng.lng, address || undefined);
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Get initial address
    reverseGeocode(initialLat, initialLng).then((address) => {
      if (address) {
        onLocationChange(initialLat, initialLng, address);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker position when initial coordinates change
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([initialLat, initialLng]);
      mapInstanceRef.current.setView([initialLat, initialLng], 15);
    }
  }, [initialLat, initialLng]);

  // Handle location search with debouncing
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowResults(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await forwardGeocode(value);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  // Handle search result selection
  const handleSelectLocation = (result: GeocodingResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Update map and marker
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }

    // Call the callback
    onLocationChange(lat, lng, result.display_name);

    // Clear search
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative space-y-2">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="w-full pl-9 pr-8 h-9 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowResults(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {isSearching && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={`${result.lat}-${result.lon}-${idx}`}
                onClick={() => handleSelectLocation(result)}
                className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b border-border last:border-b-0"
              >
                <p className="text-sm font-medium truncate">{result.display_name.split(",")[0]}</p>
                <p className="text-xs text-muted-foreground truncate">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}

        {showResults && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 p-3">
            <p className="text-xs text-muted-foreground text-center">No results found</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-[250px] rounded-lg border border-border overflow-hidden"
        style={{ background: "#1a1a2e" }}
      />
      <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded-md px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
        <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
        <span>
          {isDragging ? "Dragging..." : "Drag the pin or click the map to set location"}
        </span>
      </div>
    </div>
  );
}
