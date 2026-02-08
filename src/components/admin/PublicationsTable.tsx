import { useState } from "react";
import { Trash2, Loader2, Shield, Search, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
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
import type { PublicationRecord } from "@/hooks/useSuperAdminManagement";

interface PublicationsTableProps {
  publications: PublicationRecord[];
  loading: boolean;
  deletingId: string | null;
  onDelete: (id: string) => void;
}

const alertTypeLabels: Record<string, string> = {
  weather_alert: "Weather",
  environmental_alert: "Environmental",
  health_alert: "Health",
  safety_alert: "Safety",
  infrastructure_alert: "Infrastructure",
  general_announcement: "General",
};

const severityVariants: Record<string, "default" | "secondary" | "destructive"> = {
  low: "default",
  moderate: "secondary",
  high: "destructive",
  critical: "destructive",
};

export function PublicationsTable({ publications, loading, deletingId, onDelete }: PublicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPublications = publications.filter(
    (pub) =>
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.description.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Search publications by title, department, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Title</TableHead>
              <TableHead className="min-w-[120px]">Alert Type</TableHead>
              <TableHead className="min-w-[100px]">Severity</TableHead>
              <TableHead className="min-w-[150px]">Department</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="min-w-[80px]">Likes</TableHead>
              <TableHead className="min-w-[80px]">Dislikes</TableHead>
              <TableHead className="min-w-[80px]">Comments</TableHead>
              <TableHead className="min-w-[120px]">Created</TableHead>
              <TableHead className="min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPublications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No publications match your search" : "No publications found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPublications.map((pub) => (
                <TableRow key={pub.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className={`h-4 w-4 shrink-0 ${
                        pub.severity === "critical" ? "text-danger" :
                        pub.severity === "high" ? "text-warning" :
                        "text-primary"
                      }`} />
                      <span className="truncate max-w-[220px]">{pub.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {alertTypeLabels[pub.alert_type] || pub.alert_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityVariants[pub.severity]}>
                      {pub.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pub.department}
                  </TableCell>
                  <TableCell>
                    <span className="truncate max-w-[180px] block text-sm text-muted-foreground">
                      {pub.description.substring(0, 50)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-safe">
                      <ThumbsUp className="h-3 w-3" />
                      {pub.likes_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-danger">
                      <ThumbsDown className="h-3 w-3" />
                      {pub.dislikes_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      {pub.comments_count}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(pub.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === pub.id}
                        >
                          {deletingId === pub.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Government Alert</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{pub.title}"? This will also delete
                            all associated likes and comments. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(pub.id)}
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
        Showing {filteredPublications.length} of {publications.length} publications
      </p>
    </div>
  );
}
