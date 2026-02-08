import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Proxy tile requests to OpenWeatherMap so the API key stays server-side.
 * Query params: layer, z, x, y   (all required)
 * Supported layers: TA2, PA0, PAR0, CL, TD2, WND
 * Ref: https://openweathermap.org/api/weather-map-2
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const layer = url.searchParams.get("layer") || "PA0"; // default precipitation
    const z = url.searchParams.get("z");
    const x = url.searchParams.get("x");
    const y = url.searchParams.get("y");

    if (!z || !x || !y) {
      return new Response(JSON.stringify({ error: "Missing z, x or y param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENWEATHERMAP_API_KEY");
    if (!apiKey) {
      console.error("OPENWEATHERMAP_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Missing API key configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // OpenWeatherMap Weather Maps 2.0 endpoint
    const tileUrl = `https://maps.openweathermap.org/maps/2.0/weather/1h/${layer}/${z}/${x}/${y}?appid=${apiKey.trim()}`;

    const tileRes = await fetch(tileUrl);

    if (!tileRes.ok) {
      console.error("OWM tile fetch failed:", tileRes.status, await tileRes.text());
      return new Response(null, { status: tileRes.status, headers: corsHeaders });
    }

    const blob = await tileRes.blob();
    return new Response(blob, {
      headers: {
        ...corsHeaders,
        "Content-Type": tileRes.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=600", // cache 10 min
      },
    });
  } catch (err) {
    console.error("weather-tiles error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
