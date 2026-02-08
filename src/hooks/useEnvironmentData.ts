import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  feelsLike: number;
  icon: string;
}

export interface AirQualityData {
  aqi: number;
  level: string;
  pm25: number;
  pm10: number;
}

export interface EnvironmentData {
  weather: WeatherData;
  airQuality: AirQualityData;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  timestamp: string;
}

interface UseEnvironmentDataResult {
  data: EnvironmentData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useEnvironmentData(
  lat: number = 6.9271,
  lng: number = 79.8612
): UseEnvironmentDataResult {
  const [data, setData] = useState<EnvironmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: responseData, error: fetchError } = await supabase.functions.invoke(
        'get-environment-data',
        {
          body: { lat, lng },
        }
      );

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      setData(responseData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch environment data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    lastUpdated,
  };
}
