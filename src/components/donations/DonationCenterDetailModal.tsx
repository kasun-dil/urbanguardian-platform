import { useState } from "react";
import { 
  MapPin, 
  Phone, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Shield, 
  CheckCircle2, 
  Package,
  Send,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { 
  useDonationCenterDetails, 
  useDonationCenterComments,
  useDonationCenterLikes,
  type DonationCenter 
} from "@/hooks/useDonationCenters";
import { useAuth } from "@/contexts/AuthContext";

interface DonationCenterDetailModalProps {
  center: DonationCenter | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DonationCenterDetailModal({ center, isOpen, onClose }: DonationCenterDetailModalProps) {
  const { user } = useAuth();
  const { center: details, loading } = useDonationCenterDetails(center?.id || null);
  const { comments, addComment, deleteComment } = useDonationCenterComments(center?.id || "");
  const { userReaction, likesCount, dislikesCount, toggleReaction } = useDonationCenterLikes(center?.id || "");
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  if (!center) return null;

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    await addComment(newComment.trim());
    setNewComment("");
    setSubmittingComment(false);
  };

  // Group products by category
  const productsByCategory = details?.products.reduce((acc, product) => {
    const categoryName = details.categories.find(c => c.id === product.category_id)?.name || "Uncategorized";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(product);
    return acc;
  }, {} as Record<string, typeof details.products>) || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl">{center.name}</DialogTitle>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{center.location}</span>
              </div>
            </div>
            <Badge className={`shrink-0 ${center.status === "active" ? "bg-safe/20 text-safe border-safe/30" : "bg-muted"}`}>
              {center.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Verification Status */}
            <div className="flex flex-wrap gap-2">
              {center.is_government_verified && (
                <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                  <Shield className="h-3 w-3" />
                  Government Verified
                </Badge>
              )}
              {center.is_admin_verified && (
                <Badge variant="outline" className="gap-1 border-safe/30 text-safe">
                  <CheckCircle2 className="h-3 w-3" />
                  Admin Verified
                </Badge>
              )}
              {!center.is_government_verified && !center.is_admin_verified && (
                <Badge variant="outline" className="gap-1 border-warning/30 text-warning">
                  Pending Verification
                </Badge>
              )}
            </div>

            {/* Description */}
            {center.description && (
              <p className="text-muted-foreground">{center.description}</p>
            )}

            {/* Inventory Status */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : Object.keys(productsByCategory).length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Inventory Status</h3>
                {Object.entries(productsByCategory).map(([category, products]) => (
                  <div key={category} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{category}</p>
                    <div className="grid gap-2">
                      {products.map((product) => (
                        <div key={product.id} className="p-3 rounded-lg bg-secondary/30">
                          <div className="flex justify-between text-sm mb-2">
                            <span>{product.name}</span>
                            <span className="font-medium">
                              {product.current_count} / {product.max_capacity}
                            </span>
                          </div>
                          <Progress
                            value={(product.current_count / product.max_capacity) * 100}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round((product.current_count / product.max_capacity) * 100)}% of capacity
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No inventory items added yet
              </div>
            )}

            <Separator />

            {/* Like/Dislike */}
            <div className="flex items-center gap-4">
              <Button
                variant={userReaction === "like" ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => toggleReaction(true)}
              >
                <ThumbsUp className="h-4 w-4" />
                {likesCount}
              </Button>
              <Button
                variant={userReaction === "dislike" ? "destructive" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => toggleReaction(false)}
              >
                <ThumbsDown className="h-4 w-4" />
                {dislikesCount}
              </Button>
            </div>

            <Separator />

            {/* Comments */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments ({comments.length})
              </h3>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <Button size="icon" onClick={handleSubmitComment} disabled={submittingComment}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{comment.author_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm mt-2">{comment.content}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
