import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Clock,
  MapPin,
  CheckCircle,
  BarChart3,
  FileText,
  Trash2,
  BookOpen,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useGovernmentPublications, usePublications } from "@/hooks/usePublications";
import { useGovernmentGuides, usePreparednessGuides, categoryLabels } from "@/hooks/usePreparednessGuides";
import { CreatePublicationDialog } from "@/components/publications/CreatePublicationDialog";
import { EditPublicationDialog } from "@/components/publications/EditPublicationDialog";
import { CreateGuideDialog } from "@/components/guides/CreateGuideDialog";
import { EditGuideDialog } from "@/components/guides/EditGuideDialog";
import { RiskBadgePill, RiskLevel } from "@/components/ui/RiskBadge";
import { formatDistanceToNow } from "date-fns";

// Mock overview stats (similar to SuperAdmin but focused on government metrics)
const overviewStats = {
  totalUsers: 52847,
  activeUsers: 8432,
  totalIncidents: 15623,
  activeIncidents: 287,
  resolvedToday: 45,
  avgResponseTime: "4.2 min",
};

const incidentTrends = [
  { category: "Flooding", count: 4521, trend: 12, isUp: true },
  { category: "Road Blocks", count: 3892, trend: 5, isUp: false },
  { category: "Fallen Trees", count: 2847, trend: 8, isUp: true },
  { category: "Hazards", count: 2156, trend: 3, isUp: false },
  { category: "Other", count: 2207, trend: 2, isUp: true },
];

const cityStats = [
  { city: "Colombo", incidents: 4521, users: 18234, risk: "Moderate" },
  { city: "Kandy", incidents: 2341, users: 8923, risk: "Low" },
  { city: "Galle", incidents: 1892, users: 6721, risk: "High" },
  { city: "Jaffna", incidents: 987, users: 4521, risk: "Low" },
];

const recentActivity = [
  { action: "New incident reported", location: "Colombo 03", time: "2 mins ago", type: "incident" },
  { action: "Alert published", location: "Western Province", time: "15 mins ago", type: "alert" },
  { action: "User registered", location: "Galle", time: "23 mins ago", type: "user" },
  { action: "Incident resolved", location: "Kandy", time: "45 mins ago", type: "resolved" },
];

const alertTypeLabels: Record<string, string> = {
  weather_alert: "Weather Alert",
  environmental_alert: "Environmental Alert",
  health_alert: "Health Alert",
  safety_alert: "Safety Alert",
  infrastructure_alert: "Infrastructure Alert",
  general_announcement: "General Announcement",
};

export default function GovernmentDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { publications, loading: pubLoading, refetch } = useGovernmentPublications();
  const { deletePublication } = usePublications();
  const { guides, loading: guidesLoading, refetch: refetchGuides } = useGovernmentGuides();
  const { deleteGuide } = usePreparednessGuides();

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch();
    refetchGuides();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleDeletePublication = async (id: string) => {
    await deletePublication(id);
    refetch();
  };

  const handleDeleteGuide = async (id: string) => {
    await deleteGuide(id);
    refetchGuides();
  };

  // Auth check
  if (authLoading) {
    return (
      <MainLayout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user || role !== "government") {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Government Agent Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage publications and view analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-none h-auto p-0 gap-0">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="publications"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Publish Official Publication
                </TabsTrigger>
                <TabsTrigger
                  value="guides"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Publish Preparedness Guides
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                  title="Total Users"
                  value={overviewStats.totalUsers.toLocaleString()}
                  icon={Users}
                  trend={{ value: 12, isPositive: true }}
                  variant="primary"
                />
                <StatCard
                  title="Active Now"
                  value={overviewStats.activeUsers.toLocaleString()}
                  icon={Activity}
                  variant="safe"
                />
                <StatCard
                  title="Total Incidents"
                  value={overviewStats.totalIncidents.toLocaleString()}
                  icon={AlertTriangle}
                  variant="warning"
                />
                <StatCard
                  title="Active Incidents"
                  value={overviewStats.activeIncidents}
                  icon={MapPin}
                  variant="danger"
                />
                <StatCard
                  title="Resolved Today"
                  value={overviewStats.resolvedToday}
                  icon={CheckCircle}
                  variant="safe"
                />
                <StatCard
                  title="Avg Response"
                  value={overviewStats.avgResponseTime}
                  icon={Clock}
                  variant="default"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Incident Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Incident Categories
                    </CardTitle>
                    <CardDescription>Distribution and trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {incidentTrends.map((item) => (
                        <div key={item.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {item.count.toLocaleString()}
                              </span>
                              <span className={`flex items-center text-xs ${item.isUp ? 'text-danger' : 'text-safe'}`}>
                                {item.isUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {item.trend}%
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={(item.count / incidentTrends[0].count) * 100}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* City Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      City Performance
                    </CardTitle>
                    <CardDescription>Incidents and users by city</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cityStats.map((city) => (
                        <motion.div
                          key={city.city}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{city.city}</p>
                              <p className="text-sm text-muted-foreground">
                                {city.users.toLocaleString()} users
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{city.incidents.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              city.risk === 'Low' ? 'bg-safe/20 text-safe' :
                              city.risk === 'Moderate' ? 'bg-warning/20 text-warning' :
                              'bg-danger/20 text-danger'
                            }`}>
                              {city.risk} Risk
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest system events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          activity.type === 'incident' ? 'bg-warning/20 text-warning' :
                          activity.type === 'alert' ? 'bg-danger/20 text-danger' :
                          activity.type === 'resolved' ? 'bg-safe/20 text-safe' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {activity.type === 'incident' && <AlertTriangle className="h-4 w-4" />}
                          {activity.type === 'alert' && <FileText className="h-4 w-4" />}
                          {activity.type === 'user' && <Users className="h-4 w-4" />}
                          {activity.type === 'resolved' && <CheckCircle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.action}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{activity.location}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Publications Tab */}
            <TabsContent value="publications" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">My Publications</h2>
                  <p className="text-sm text-muted-foreground">
                    Create and manage official publications
                  </p>
                </div>
                <CreatePublicationDialog />
              </div>

              {pubLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : publications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Publications Yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Start creating official publications to inform the public about important alerts and updates.
                    </p>
                    <CreatePublicationDialog />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {publications.map((pub, index) => (
                    <motion.div
                      key={pub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {alertTypeLabels[pub.alert_type] || pub.alert_type}
                                </Badge>
                                <RiskBadgePill level={pub.severity as RiskLevel} />
                              </div>
                              <h3 className="font-semibold text-lg">{pub.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{pub.department}</p>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {pub.description}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(pub.created_at), { addSuffix: true })}
                                </span>
                                <span>👍 {pub.likes_count}</span>
                                <span>👎 {pub.dislikes_count}</span>
                                <span>💬 {pub.comments_count}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <EditPublicationDialog publication={pub} onSuccess={refetch} />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Publication</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this publication? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePublication(pub.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                )}
            </TabsContent>

            {/* Preparedness Guides Tab */}
            <TabsContent value="guides" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">My Preparedness Guides</h2>
                  <p className="text-sm text-muted-foreground">
                    Create and manage preparedness guides for the public
                  </p>
                </div>
                <CreateGuideDialog />
              </div>

              {guidesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : guides.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Guides Yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Start creating preparedness guides to help citizens prepare for emergencies.
                    </p>
                    <CreateGuideDialog />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {guides.map((guide, index) => (
                    <motion.div
                      key={guide.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {categoryLabels[guide.category]}
                                </Badge>
                                <Badge className={`text-xs ${
                                  guide.relevance === 'high' ? 'bg-danger/20 text-danger' :
                                  guide.relevance === 'medium' ? 'bg-warning/20 text-warning' :
                                  'bg-secondary text-muted-foreground'
                                }`}>
                                  {guide.relevance.charAt(0).toUpperCase() + guide.relevance.slice(1)} Relevance
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-lg">{guide.title}</h3>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {guide.description}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(guide.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <EditGuideDialog guide={guide} onSuccess={refetchGuides} />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Guide</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this preparedness guide? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteGuide(guide.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
