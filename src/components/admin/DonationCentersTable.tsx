import { useState } from "react";
import { Trash2, Loader2, MapPin, Building, Phone, Search, CheckCircle, XCircle } from "lucide-react";
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
import type { DonationCenterRecord } from "@/hooks/useSuperAdminManagement";

interface DonationCentersTableProps {
  centers: DonationCenterRecord[];
  loading: boolean;
  deletingId: string | null;
  onDelete: (id: string) => void;
}

export function DonationCentersTable({ centers, loading, deletingId, onDelete }: DonationCentersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCenters = centers.filter(
    (center) =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.location.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Search donation centers by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Location</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Phone Numbers</TableHead>
              <TableHead className="min-w-[80px]">Likes</TableHead>
              <TableHead className="min-w-[80px]">Dislikes</TableHead>
              <TableHead className="min-w-[80px]">Comments</TableHead>
              <TableHead className="min-w-[100px]">Admin ✓</TableHead>
              <TableHead className="min-w-[100px]">Govt ✓</TableHead>
              <TableHead className="min-w-[120px]">Created</TableHead>
              <TableHead className="min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCenters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No centers match your search" : "No donation centers found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCenters.map((center) => (
                <TableRow key={center.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate max-w-[180px]">{center.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[180px]">{center.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={center.status === "active" ? "default" : "secondary"}>
                      {center.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-sm">{center.phone_numbers.length}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-safe">{center.likes_count}</TableCell>
                  <TableCell className="text-danger">{center.dislikes_count}</TableCell>
                  <TableCell>{center.comments_count}</TableCell>
                  <TableCell>
                    {center.is_admin_verified ? (
                      <CheckCircle className="h-4 w-4 text-safe" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    {center.is_government_verified ? (
                      <CheckCircle className="h-4 w-4 text-safe" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(center.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === center.id}
                        >
                          {deletingId === center.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Donation Center</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{center.name}"? This will also delete
                            all associated products, categories, likes, and comments. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(center.id)}
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
        Showing {filteredCenters.length} of {centers.length} donation centers
      </p>
    </div>
  );
}
