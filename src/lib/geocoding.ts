// Geocoding service using Nominatim (OpenStreetMap)
// Free, no API key required, respects usage policy with proper user agent

interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    // Add "Sri Lanka" context for better local results
    const searchQuery = address.toLowerCase().includes("sri lanka") 
      ? address 
      : `${address}, Sri Lanka`;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      {
        headers: {
          "User-Agent": "DisasterManagementApp/1.0",
        },
      }
    );

    if (!response.ok) {
      console.error("Geocoding request failed:", response.status);
      return null;
    }

    const results = await response.json();
    
    if (results && results.length > 0) {
      const result = results[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Fallback: Generate coordinates around Colombo with slight random offset
export function getFallbackCoordinates(): { lat: number; lng: number } {
  const baseLat = 6.9271; // Colombo
  const baseLng = 79.8612;
  
  // Random offset within ~1km
  const latOffset = (Math.random() - 0.5) * 0.02;
  const lngOffset = (Math.random() - 0.5) * 0.02;
  
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
  };
}
