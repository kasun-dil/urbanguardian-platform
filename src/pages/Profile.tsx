import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Clock, Edit, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useUserIncidents } from "@/hooks/useUserIncidents";
import { EditIncidentDialog } from "@/components/incidents/EditIncidentDialog";
import { formatDistanceToNow } from "date-fns";
import type { Incident } from "@/hooks/useIncidents";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, role, loading: authLoading } = useAuth();
  const { incidents, loading, deleteIncident, updateIncident } = useUserIncidents();
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-danger text-white";
      case "high": return "bg-warning text-black";
      case "moderate": return "bg-warning/70 text-black";
      default: return "bg-safe text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle className="h-4 w-4 text-safe" />;
      case "investigating": return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <AlertTriangle className="h-4 w-4 text-danger" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      flooding: "Flooding",
      blocked_road: "Blocked Road",
      fallen_tree: "Fallen Tree",
      hazard: "Hazard Zone",
      other: "Other",
    };
    return labels[type] || type;
  };

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile?.full_name || "User"}</h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {role || "Citizen"} Account
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{incidents.length}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-danger">
                  {incidents.filter(i => i.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-warning">
                  {incidents.filter(i => i.status === "investigating").length}
                </p>
                <p className="text-sm text-muted-foreground">Investigating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-safe">
                  {incidents.filter(i => i.status === "resolved").length}
                </p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </CardContent>
            </Card>
          </div>

          {/* My Incidents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                My Reported Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't reported any incidents yet</p>
                  <Button 
                    className="mt-4 bg-gradient-primary"
                    onClick={() => navigate("/incidents")}
                  >
                    Report an Incident
                  </Button>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-3">
                    {incidents.map((incident, index) => (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-card/80 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(incident.status)}
                            <h3 className="font-semibold">{incident.title}</h3>
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {incident.description || "No description provided"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {incident.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                            </span>
                            <Badge variant="outline">{getTypeLabel(incident.type)}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>❤️ {incident.likes_count} likes</span>
                            <span>💬 {incident.comments_count} comments</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingIncident(incident)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Incident</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{incident.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteIncident(incident.id)}
                                  className="bg-danger hover:bg-danger/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingIncident && (
        <EditIncidentDialog
          incident={editingIncident}
          open={!!editingIncident}
          onOpenChange={(open) => !open && setEditingIncident(null)}
          onSubmit={updateIncident}
        />
      )}
    </MainLayout>
  );
}
