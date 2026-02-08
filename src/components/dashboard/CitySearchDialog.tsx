import { useState, useCallback, useEffect } from "react";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface CitySearchDialogProps {
  currentCity: string;
  onCitySelect: (lat: number, lng: number, cityName: string) => void;
  trigger?: React.ReactNode;
}

export function CitySearchDialog({ currentCity, onCitySelect, trigger }: CitySearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=8&addressdetails=1`,
          {
            headers: {
              "User-Agent": "DisasterManagementApp/1.0",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    // Extract city name from display_name
    const parts = result.display_name.split(",");
    const cityName = parts[0].trim();
    
    onCitySelect(parseFloat(result.lat), parseFloat(result.lon), cityName);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get city name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "User-Agent": "DisasterManagementApp/1.0",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const cityName =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.municipality ||
              data.address?.county ||
              "Current Location";

            onCitySelect(latitude, longitude, cityName);
            setOpen(false);
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          onCitySelect(latitude, longitude, "Current Location");
          setOpen(false);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onCitySelect]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Navigation className="h-4 w-4" />
            Change City
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Search Location
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current location button */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleUseCurrentLocation}
            disabled={locating}
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {locating ? "Detecting location..." : "Use my current location"}
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a city or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {results.length > 0 && (
            <ScrollArea className="h-[250px] rounded-md border">
              <div className="p-2 space-y-1">
                {results.map((result, index) => (
                  <button
                    key={`${result.lat}-${result.lon}-${index}`}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <p className="font-medium text-sm truncate">
                      {result.display_name.split(",")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.display_name}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No locations found. Try a different search term.
            </p>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Currently viewing: <span className="font-medium">{currentCity}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
