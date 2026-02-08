import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  MessageSquare,
  ThumbsUp,
  Share2,
  Droplets,
  Car,
  TreeDeciduous,
  AlertOctagon,
  AlertTriangle,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiskBadgePill } from "@/components/ui/RiskBadge";
import type { Incident, IncidentComment } from "@/hooks/useIncidents";
import { toast } from "sonner";

const incidentTypeConfig = {
  flooding: { icon: Droplets, color: "text-primary" },
  blocked_road: { icon: Car, color: "text-warning" },
  fallen_tree: { icon: TreeDeciduous, color: "text-safe" },
  hazard: { icon: AlertOctagon, color: "text-danger" },
  other: { icon: AlertTriangle, color: "text-muted-foreground" },
};

interface IncidentCardProps {
  incident: Incident;
  index: number;
  onLike: (incidentId: string) => Promise<boolean>;
  onComment: (incidentId: string, content: string) => Promise<boolean>;
  onFetchComments: (incidentId: string) => Promise<IncidentComment[]>;
}

export function IncidentCard({
  incident,
  index,
  onLike,
  onComment,
  onFetchComments,
}: IncidentCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<IncidentComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const typeConfig = incidentTypeConfig[incident.type] || incidentTypeConfig.other;
  const IconComponent = typeConfig.icon;

  const handleToggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      const fetchedComments = await onFetchComments(incident.id);
      setComments(fetchedComments);
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const success = await onComment(incident.id, newComment.trim());
    if (success) {
      setNewComment("");
      const fetchedComments = await onFetchComments(incident.id);
      setComments(fetchedComments);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/incidents?id=${incident.id}`;
    const shareData = {
      title: incident.title,
      text: `${incident.title} - ${incident.location}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const formattedTime = formatDistanceToNow(new Date(incident.created_at), { addSuffix: true });

  // Map severity to RiskLevel
  const severityToRisk: Record<string, "low" | "moderate" | "high" | "critical"> = {
    low: "low",
    moderate: "moderate",
    high: "high",
    critical: "critical",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 ${typeConfig.color}`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-medium text-sm line-clamp-1">{incident.title}</h3>
                <RiskBadgePill level={severityToRisk[incident.severity] || "moderate"} />
              </div>
              {incident.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {incident.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {incident.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formattedTime}
                </span>
                <span className="text-muted-foreground/70">by {incident.reported_by}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                <button
                  onClick={() => onLike(incident.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ThumbsUp className="h-3 w-3" />
                  {incident.likes_count}
                </button>
                <button
                  onClick={handleToggleComments}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  {incident.comments_count}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </button>
              </div>

              {/* Comments Section */}
              {showComments && (
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  {loadingComments ? (
                    <p className="text-xs text-muted-foreground">Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No comments yet</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="text-xs bg-secondary/50 p-2 rounded">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{comment.author_name}</span>
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="text-xs h-8"
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    />
                    <Button size="sm" className="h-8 px-2" onClick={handleAddComment}>
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
