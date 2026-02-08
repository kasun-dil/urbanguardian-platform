import { useState } from "react";
import { Trash2, Loader2, MapPin, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { IncidentRecord } from "@/hooks/useSuperAdminManagement";

interface IncidentsTableProps {
  incidents: IncidentRecord[];
  loading: boolean;
  deletingId: string | null;
  onDelete: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  flooding: "Flooding",
  blocked_road: "Road Block",
  fallen_tree: "Fallen Tree",
  hazard: "Hazard",
  other: "Other",
};

const severityVariants: Record<string, "default" | "secondary" | "destructive"> = {
  low: "default",
  moderate: "secondary",
  high: "destructive",
  critical: "destructive",
};

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "destructive",
  investigating: "secondary",
  resolved: "default",
};

export function IncidentsTable({ incidents, loading, deletingId, onDelete }: IncidentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reported_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search incidents by title, location, or reporter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead className="min-w-[100px]">Type</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[100px]">Severity</TableHead>
              <TableHead className="min-w-[200px]">Location</TableHead>
              <TableHead className="min-w-[120px]">Reported By</TableHead>
              <TableHead className="min-w-[80px]">Likes</TableHead>
              <TableHead className="min-w-[80px]">Comments</TableHead>
              <TableHead className="min-w-[120px]">Created</TableHead>
              <TableHead className="min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No incidents match your search" : "No incidents found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                      <span className="truncate max-w-[180px]">{incident.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[incident.type] || incident.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[incident.status] as any}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityVariants[incident.severity]}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[180px]">{incident.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {incident.reported_by}
                  </TableCell>
                  <TableCell>{incident.likes_count}</TableCell>
                  <TableCell>{incident.comments_count}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === incident.id}
                        >
                          {deletingId === incident.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Incident</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{incident.title}"? This will also
                            delete all associated likes and comments. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(incident.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <p className="text-sm text-muted-foreground">
        Showing {filteredIncidents.length} of {incidents.length} incidents
      </p>
    </div>
  );
}
