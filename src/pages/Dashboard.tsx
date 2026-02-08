import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  MapPin,
  Activity,
  Eye,
  RefreshCw,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/ui/StatCard";
import { RiskBadgePill, RiskLevel } from "@/components/ui/RiskBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OpenWeatherMap } from "@/components/maps/OpenWeatherMap";
import { CitySearchDialog } from "@/components/dashboard/CitySearchDialog";
import { useEnvironmentData } from "@/hooks/useEnvironmentData";
import { useDashboardAlerts, useDashboardIncidents } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

// Helper to determine risk level for publications
function getSeverityRiskLevel(severity: string): RiskLevel {
  switch (severity) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "moderate":
      return "moderate";
    case "low":
      return "low";
    default:
      return "safe";
  }
}

// Helper to determine StatCard variant from AQI
function getAqiStatVariant(aqi: number): "safe" | "warning" | "danger" {
  if (aqi <= 50) return "safe";
  if (aqi <= 100) return "warning";
  return "danger";
}

// Helper to determine risk level from AQI
function getAqiRiskLevel(aqi: number): RiskLevel {
  if (aqi <= 50) return "safe";
  if (aqi <= 100) return "moderate";
  if (aqi <= 200) return "high";
  return "critical";
}

// Helper to determine weather risk
function getWeatherRisk(condition: string): { level: "safe" | "warning" | "danger"; label: string } {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes("thunderstorm") || lowerCondition.includes("tornado")) {
    return { level: "danger", label: "High" };
  }
  if (lowerCondition.includes("rain") || lowerCondition.includes("storm") || lowerCondition.includes("snow")) {
    return { level: "warning", label: "Moderate" };
  }
  return { level: "safe", label: "Low" };
}

// Truncate description with ellipsis
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

// Get border color based on severity
function getSeverityBorderColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "border-critical";
    case "high":
      return "border-danger";
    case "moderate":
      return "border-warning";
    default:
      return "border-safe";
  }
}

// Get category chart color
function getCategoryColor(index: number): string {
  const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
  return colors[index % colors.length];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState({ lat: 6.9271, lng: 79.8612 });
  const [cityName, setCityName] = useState("Colombo");
  const [locationLoading, setLocationLoading] = useState(true);

  const { data: envData, isLoading, refetch, lastUpdated } = useEnvironmentData(
    coordinates.lat,
    coordinates.lng
  );

  const { alerts, loading: alertsLoading } = useDashboardAlerts();
  const { stats: incidentStats, loading: incidentsLoading } = useDashboardIncidents();

  // Get user's location on mount with high accuracy
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

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
            const detectedCity =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.municipality ||
              data.address?.county ||
              "Unknown Location";
            setCityName(detectedCity);
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationLoading(false);
        // Keep default Colombo coordinates
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  // Called when user picks a location from search, map click, or city dialog
  const handleLocationChange = useCallback((lat: number, lng: number, newCityName?: string) => {
    setCoordinates({ lat, lng });
    if (newCityName) {
      setCityName(newCityName);
    }
  }, []);

  const handleRefresh = async () => {
    await refetch();
  };

  const displayCity = envData?.location.city || cityName;

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h1 className="text-2xl font-bold">{displayCity} Dashboard</h1>
                  {isLoading || locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="h-2 w-2 bg-safe rounded-full pulse-live" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Real-time urban risk monitoring • Last updated:{" "}
                  {lastUpdated?.toLocaleTimeString() || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <CitySearchDialog
                  currentCity={displayCity}
                  onCitySelect={handleLocationChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Risk Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </>
            ) : (
              <>
                <StatCard
                  title="Weather Risk"
                  value={envData ? getWeatherRisk(envData.weather.condition).label : "—"}
                  subtitle={envData ? `${envData.weather.temperature}°C • ${envData.weather.condition}` : "Loading..."}
                  icon={Cloud}
                  variant={envData ? getWeatherRisk(envData.weather.condition).level : "default"}
                />
                <StatCard
                  title="Air Quality"
                  value={envData ? `AQI ${envData.airQuality.aqi}` : "—"}
                  subtitle={envData?.airQuality.level || "Loading..."}
                  icon={Wind}
                  variant={envData ? getAqiStatVariant(envData.airQuality.aqi) : "default"}
                />
                <StatCard
                  title="Flood Risk"
                  value="Low"
                  subtitle="No immediate threats"
                  icon={Droplets}
                  variant="safe"
                />
                <StatCard
                  title="Active Alerts"
                  value={alertsLoading ? "—" : alerts.length}
                  subtitle="Official publications"
                  icon={AlertTriangle}
                  variant={alerts.length > 0 ? "warning" : "safe"}
                />
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {/* Main Map Area */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* OpenWeather Real-Time Map */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Real-Time Weather Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[400px]">
                    <OpenWeatherMap
                      center={[coordinates.lat, coordinates.lng]}
                      zoom={8}
                      onLocationChange={handleLocationChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Weather Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-primary" />
                    Weather Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Skeleton className="h-24 rounded-lg" />
                      <Skeleton className="h-24 rounded-lg" />
                      <Skeleton className="h-24 rounded-lg" />
                      <Skeleton className="h-24 rounded-lg" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-secondary/30 text-center">
                        <Thermometer className="h-6 w-6 mx-auto mb-2 text-warning" />
                        <p className="text-2xl font-bold">{envData?.weather.temperature || "—"}°C</p>
                        <p className="text-xs text-muted-foreground">Temperature</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/30 text-center">
                        <Droplets className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{envData?.weather.humidity || "—"}%</p>
                        <p className="text-xs text-muted-foreground">Humidity</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/30 text-center">
                        <Wind className="h-6 w-6 mx-auto mb-2 text-accent" />
                        <p className="text-2xl font-bold">{envData?.weather.windSpeed || "—"}</p>
                        <p className="text-xs text-muted-foreground">Wind (km/h)</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/30 text-center">
                        <Eye className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{envData?.weather.feelsLike || "—"}°C</p>
                        <p className="text-xs text-muted-foreground">Feels Like</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Air Quality Index - Under Weather */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
                    Air Quality Index
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-16 w-24 mx-auto mb-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-16 rounded-lg" />
                        <Skeleton className="h-16 rounded-lg" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <p className={`text-5xl font-bold ${getAqiStatVariant(envData?.airQuality.aqi || 0) === "safe" ? "text-safe" : getAqiStatVariant(envData?.airQuality.aqi || 0) === "warning" ? "text-warning" : "text-danger"}`}>
                          {envData?.airQuality.aqi || "—"}
                        </p>
                        <RiskBadgePill level={getAqiRiskLevel(envData?.airQuality.aqi || 0)} className="mt-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-secondary/30 text-center">
                          <p className="text-lg font-bold">{envData?.airQuality.pm25 || "—"}</p>
                          <p className="text-xs text-muted-foreground">PM2.5 (μg/m³)</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 text-center">
                          <p className="text-lg font-bold">{envData?.airQuality.pm10 || "—"}</p>
                          <p className="text-xs text-muted-foreground">PM10 (μg/m³)</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              {/* Active Alerts - Real-time from official_publications */}
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      Active Alerts
                    </span>
                    <span className="h-6 w-6 rounded-full bg-warning/20 text-warning text-xs flex items-center justify-center font-bold">
                      {alertsLoading ? "—" : alerts.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-1">
                  {alertsLoading ? (
                    <>
                      <Skeleton className="h-24 rounded-lg" />
                      <Skeleton className="h-24 rounded-lg" />
                    </>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active alerts</p>
                    </div>
                  ) : (
                    <>
                      {alerts.slice(0, 3).map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg bg-secondary/30 border-l-4 ${getSeverityBorderColor(alert.severity)}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-sm line-clamp-1">{alert.title}</p>
                            <RiskBadgePill level={getSeverityRiskLevel(alert.severity)} />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {truncateText(alert.description, 80)}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                            </p>
                            <span className="text-xs text-primary/70">{alert.department}</span>
                          </div>
                        </motion.div>
                      ))}
                      {alerts.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => navigate("/government-hub")}
                        >
                          View all {alerts.length} alerts
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Incident Statistics - Real-time from incidents table */}
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Incident Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  {incidentsLoading ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <Skeleton className="h-20 rounded-lg" />
                        <Skeleton className="h-20 rounded-lg" />
                        <Skeleton className="h-20 rounded-lg" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 rounded-lg bg-secondary/30">
                          <p className="text-2xl font-bold">{incidentStats.total}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="p-3 rounded-lg bg-safe/10">
                          <p className="text-2xl font-bold text-safe">{incidentStats.resolved}</p>
                          <p className="text-xs text-muted-foreground">Resolved</p>
                        </div>
                        <div className="p-3 rounded-lg bg-warning/10">
                          <p className="text-2xl font-bold text-warning">{incidentStats.active}</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                      </div>

                      {incidentStats.total > 0 ? (
                        <div className="space-y-3">
                          {incidentStats.categories
                            .filter((cat) => cat.count > 0)
                            .map((cat, index) => (
                              <div key={cat.type} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{cat.name}</span>
                                  <span className="font-medium">{cat.count}</span>
                                </div>
                                <Progress
                                  value={(cat.count / incidentStats.total) * 100}
                                  className={`h-2`}
                                />
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No incidents reported</p>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => navigate("/incidents")}
                      >
                        View all incidents
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
