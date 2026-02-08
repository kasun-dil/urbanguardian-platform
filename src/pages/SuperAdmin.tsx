import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Server,
  RefreshCw,
  Download,
  MapPin,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  MessageSquare,
  Heart,
  Package,
  Building,
  FileText,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSuperAdminData } from "@/hooks/useSuperAdminData";
import { useSuperAdminManagement } from "@/hooks/useSuperAdminManagement";
import { IncidentsTable } from "@/components/admin/IncidentsTable";
import { DonationCentersTable } from "@/components/admin/DonationCentersTable";
import { PublicationsTable } from "@/components/admin/PublicationsTable";
import { UsersTable } from "@/components/admin/UsersTable";

export default function SuperAdmin() {
  const {
    loading,
    systemHealth,
    overviewStats,
    incidentCategories,
    recentActivity,
    cityStats,
    refetch,
    exportData,
  } = useSuperAdminData();

  const {
    incidents,
    donationCenters,
    publications,
    users,
    loadingIncidents,
    loadingDonations,
    loadingPublications,
    loadingUsers,
    deletingId,
    fetchIncidents,
    fetchDonationCenters,
    fetchPublications,
    fetchUsers,
    deleteIncident,
    deleteDonationCenter,
    deletePublication,
    deleteUser,
  } = useSuperAdminManagement();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetch(),
      fetchIncidents(),
      fetchDonationCenters(),
      fetchPublications(),
      fetchUsers(),
    ]);
    setIsRefreshing(false);
  };

  const handleExport = () => {
    exportData();
  };

  if (loading) {
    return (
      <MainLayout showFooter={false}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </MainLayout>
    );
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
                  <h1 className="text-xl font-bold">Super Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time system overview and management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
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

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <StatCard
              title="Total Users"
              value={overviewStats.totalUsers.toLocaleString()}
              icon={Users}
              variant="primary"
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
              title="Publications"
              value={overviewStats.totalPublications}
              icon={FileText}
              variant="primary"
            />
            <StatCard
              title="Donation Centers"
              value={overviewStats.totalDonationCenters}
              icon={Building}
              variant="safe"
            />
            <StatCard
              title="Total Comments"
              value={overviewStats.totalComments}
              icon={MessageSquare}
              variant="default"
            />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* System Health */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-primary" />
                      System Health
                    </CardTitle>
                    <CardDescription>Real-time service status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${systemHealth.database.status === 'operational' ? 'bg-safe' : 'bg-danger'}`} />
                        <div>
                          <p className="font-medium">Database</p>
                          <p className="text-xs text-muted-foreground">{systemHealth.database.latency}ms latency</p>
                        </div>
                      </div>
                      <Badge variant={systemHealth.database.status === 'operational' ? 'default' : 'destructive'}>
                        {systemHealth.database.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${systemHealth.realtime.status === 'operational' ? 'bg-safe' : 'bg-danger'}`} />
                        <div>
                          <p className="font-medium">Realtime</p>
                          <p className="text-xs text-muted-foreground">{systemHealth.realtime.connections} active</p>
                        </div>
                      </div>
                      <Badge variant={systemHealth.realtime.status === 'operational' ? 'default' : 'destructive'}>
                        {systemHealth.realtime.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Incident Categories */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Incident Categories
                    </CardTitle>
                    <CardDescription>Distribution by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {incidentCategories.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No incidents recorded</p>
                      ) : (
                        incidentCategories.map((item) => (
                          <div key={item.type} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{item.name}</span>
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
                              value={incidentCategories[0]?.count ? (item.count / incidentCategories[0].count) * 100 : 0}
                              className="h-2"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* City Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      City Performance
                    </CardTitle>
                    <CardDescription>Incidents and donations by location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {cityStats.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">No location data available</p>
                        ) : (
                          cityStats.map((city) => (
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
                                    {city.donations} donation centers
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{city.incidents} incidents</p>
                                <Badge variant={
                                  city.risk === 'Low' ? 'default' :
                                  city.risk === 'Moderate' ? 'secondary' : 'destructive'
                                }>
                                  {city.risk} Risk
                                </Badge>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

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
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {recentActivity.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">No recent activity</p>
                        ) : (
                          recentActivity.map((activity) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                            >
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                activity.type === 'incident' ? 'bg-warning/20 text-warning' :
                                activity.type === 'alert' ? 'bg-danger/20 text-danger' :
                                activity.type === 'resolved' ? 'bg-safe/20 text-safe' :
                                activity.type === 'donation' ? 'bg-primary/20 text-primary' :
                                activity.type === 'comment' ? 'bg-secondary text-foreground' :
                                'bg-primary/20 text-primary'
                              }`}>
                                {activity.type === 'incident' && <AlertTriangle className="h-4 w-4" />}
                                {activity.type === 'alert' && <Shield className="h-4 w-4" />}
                                {activity.type === 'user' && <Users className="h-4 w-4" />}
                                {activity.type === 'resolved' && <CheckCircle className="h-4 w-4" />}
                                {activity.type === 'donation' && <Building className="h-4 w-4" />}
                                {activity.type === 'comment' && <MessageSquare className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{activity.action}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{activity.location}</span>
                                  <span>•</span>
                                  <Clock className="h-3 w-3 shrink-0" />
                                  <span>{activity.time}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Incidents"
                  value={incidents.length}
                  icon={AlertTriangle}
                  variant="warning"
                />
                <StatCard
                  title="Active"
                  value={incidents.filter((i) => i.status === "active").length}
                  icon={Activity}
                  variant="danger"
                />
                <StatCard
                  title="Investigating"
                  value={incidents.filter((i) => i.status === "investigating").length}
                  icon={Clock}
                  variant="primary"
                />
                <StatCard
                  title="Resolved"
                  value={incidents.filter((i) => i.status === "resolved").length}
                  icon={CheckCircle}
                  variant="safe"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Incidents</CardTitle>
                  <CardDescription>Complete list of all reported incidents with management options</CardDescription>
                </CardHeader>
                <CardContent>
                  <IncidentsTable
                    incidents={incidents}
                    loading={loadingIncidents}
                    deletingId={deletingId}
                    onDelete={deleteIncident}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="donations" className="space-y-6">
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                  title="Total Centers"
                  value={donationCenters.length}
                  icon={Building}
                  variant="primary"
                />
                <StatCard
                  title="Active Centers"
                  value={donationCenters.filter((c) => c.status === "active").length}
                  icon={CheckCircle}
                  variant="safe"
                />
                <StatCard
                  title="Inactive Centers"
                  value={donationCenters.filter((c) => c.status === "inactive").length}
                  icon={XCircle}
                  variant="warning"
                />
                <StatCard
                  title="Admin Verified"
                  value={donationCenters.filter((c) => c.is_admin_verified).length}
                  icon={Shield}
                  variant="primary"
                />
                <StatCard
                  title="Govt Verified"
                  value={donationCenters.filter((c) => c.is_government_verified).length}
                  icon={Shield}
                  variant="safe"
                />
                <StatCard
                  title="Total Likes"
                  value={donationCenters.reduce((sum, c) => sum + c.likes_count, 0)}
                  icon={Heart}
                  variant="danger"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Donation Centers</CardTitle>
                  <CardDescription>Complete list of all registered donation centers with management options</CardDescription>
                </CardHeader>
                <CardContent>
                  <DonationCentersTable
                    centers={donationCenters}
                    loading={loadingDonations}
                    deletingId={deletingId}
                    onDelete={deleteDonationCenter}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Publications"
                  value={publications.length}
                  icon={FileText}
                  variant="primary"
                />
                <StatCard
                  title="Critical Alerts"
                  value={publications.filter((p) => p.severity === "critical").length}
                  icon={AlertTriangle}
                  variant="danger"
                />
                <StatCard
                  title="High Severity"
                  value={publications.filter((p) => p.severity === "high").length}
                  icon={Shield}
                  variant="warning"
                />
                <StatCard
                  title="Total Engagement"
                  value={publications.reduce((sum, p) => sum + p.likes_count + p.comments_count, 0)}
                  icon={Heart}
                  variant="safe"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Government Alerts</CardTitle>
                  <CardDescription>Complete list of all official publications and alerts with management options</CardDescription>
                </CardHeader>
                <CardContent>
                  <PublicationsTable
                    publications={publications}
                    loading={loadingPublications}
                    deletingId={deletingId}
                    onDelete={deletePublication}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UsersTable
                users={users}
                loading={loadingUsers}
                deletingId={deletingId}
                onDelete={deleteUser}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
