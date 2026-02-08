import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  feelsLike: number;
  icon: string;
}

interface AirQualityData {
  aqi: number;
  level: string;
  pm25: number;
  pm10: number;
}

// Fallback data when APIs are unavailable
const fallbackWeather: WeatherData = {
  temperature: 28,
  humidity: 75,
  windSpeed: 12,
  condition: "Partly Cloudy",
  feelsLike: 31,
  icon: "02d",
};

const fallbackAqi: AirQualityData = {
  aqi: 52,
  level: "Moderate",
  pm25: 15.2,
  pm10: 28.5,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat = 6.9271, lng = 79.8612 } = await req.json().catch(() => ({}));

    const OPENWEATHERMAP_API_KEY = Deno.env.get('OPENWEATHERMAP_API_KEY');
    const WAQI_API_KEY = Deno.env.get('WAQI_API_KEY');

    let weatherData: WeatherData = fallbackWeather;
    let airQualityData: AirQualityData = fallbackAqi;
    let cityName = "Colombo";
    let usingFallback = false;

    // Try to fetch weather data
    if (OPENWEATHERMAP_API_KEY) {
      const weatherApiKey = OPENWEATHERMAP_API_KEY.trim();
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${weatherApiKey}`;
      console.log('Fetching weather from:', weatherUrl.replace(weatherApiKey, 'REDACTED'));
      
      try {
        const weatherResponse = await fetch(weatherUrl);
        
        if (weatherResponse.ok) {
          const weatherJson = await weatherResponse.json();
          weatherData = {
            temperature: Math.round(weatherJson.main.temp),
            humidity: weatherJson.main.humidity,
            windSpeed: Math.round(weatherJson.wind.speed * 3.6),
            condition: weatherJson.weather[0]?.main || 'Unknown',
            feelsLike: Math.round(weatherJson.main.feels_like),
            icon: weatherJson.weather[0]?.icon || '01d',
          };
          cityName = weatherJson.name || "Unknown";
        } else {
          const errorText = await weatherResponse.text();
          console.warn('Weather API returned error, using fallback:', errorText);
          usingFallback = true;
        }
      } catch (weatherError) {
        console.warn('Weather fetch failed, using fallback:', weatherError);
        usingFallback = true;
      }
    } else {
      console.warn('OPENWEATHERMAP_API_KEY not configured, using fallback');
      usingFallback = true;
    }

    // Try to fetch AQI data
    if (WAQI_API_KEY) {
      const aqiApiKey = WAQI_API_KEY.trim();
      const aqiUrl = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${aqiApiKey}`;
      console.log('Fetching AQI from:', aqiUrl.replace(aqiApiKey, 'REDACTED'));
      
      try {
        const aqiResponse = await fetch(aqiUrl);
        
        if (aqiResponse.ok) {
          const aqiJson = await aqiResponse.json();
          
          if (aqiJson.status === 'ok' && aqiJson.data) {
            const aqi = aqiJson.data.aqi;
            let level = 'Unknown';
            
            if (aqi <= 50) level = 'Good';
            else if (aqi <= 100) level = 'Moderate';
            else if (aqi <= 150) level = 'Unhealthy for Sensitive';
            else if (aqi <= 200) level = 'Unhealthy';
            else if (aqi <= 300) level = 'Very Unhealthy';
            else level = 'Hazardous';

            airQualityData = {
              aqi: aqi,
              level: level,
              pm25: aqiJson.data.iaqi?.pm25?.v || 0,
              pm10: aqiJson.data.iaqi?.pm10?.v || 0,
            };
          } else {
            console.warn('WAQI returned non-ok status, using fallback:', aqiJson);
          }
        } else {
          const errorText = await aqiResponse.text();
          console.warn('AQI API returned error, using fallback:', errorText);
        }
      } catch (aqiError) {
        console.warn('AQI fetch failed, using fallback:', aqiError);
      }
    } else {
      console.warn('WAQI_API_KEY not configured, using fallback');
    }

    return new Response(
      JSON.stringify({
        weather: weatherData,
        airQuality: airQualityData,
        location: {
          lat,
          lng,
          city: cityName,
        },
        timestamp: new Date().toISOString(),
        usingFallback,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching environment data:', error);
    // Return fallback data on any error
    return new Response(
      JSON.stringify({
        weather: fallbackWeather,
        airQuality: fallbackAqi,
        location: {
          lat: 6.9271,
          lng: 79.8612,
          city: "Colombo",
        },
        timestamp: new Date().toISOString(),
        usingFallback: true,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
