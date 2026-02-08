import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Building2,
  Shield,
  Clock,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RiskBadgePill, RiskLevel } from "@/components/ui/RiskBadge";
import type { Publication, PublicationComment } from "@/hooks/usePublications";

const alertTypeLabels: Record<string, string> = {
  weather_alert: "Weather Alert",
  environmental_alert: "Environmental Alert",
  health_alert: "Health Alert",
  safety_alert: "Safety Alert",
  infrastructure_alert: "Infrastructure Alert",
  general_announcement: "General Announcement",
};

interface PublicationCardProps {
  publication: Publication;
  index?: number;
  userReaction: boolean | null | undefined;
  onToggleReaction: (publicationId: string, isLike: boolean) => Promise<void> | void;
  onAddComment: (publicationId: string, content: string) => Promise<{ error: unknown }>;
  onFetchComments: (publicationId: string) => Promise<PublicationComment[]>;
}

export function PublicationCard({
  publication,
  index = 0,
  userReaction,
  onToggleReaction,
  onAddComment,
  onFetchComments,
}: PublicationCardProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PublicationComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(publication.created_at), { addSuffix: true });

  const handleToggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      const fetchedComments = await onFetchComments(publication.id);
      setComments(fetchedComments);
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async () => {
    if (!feedbackText.trim()) return;

    setIsSubmittingComment(true);
    const { error } = await onAddComment(publication.id, feedbackText.trim());

    if (!error) {
      setFeedbackText("");
      const fetchedComments = await onFetchComments(publication.id);
      setComments(fetchedComments);
    }
    setIsSubmittingComment(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:border-primary/50 transition-all duration-200">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {alertTypeLabels[publication.alert_type] || publication.alert_type}
                  </Badge>
                  <RiskBadgePill level={publication.severity as RiskLevel} />
                </div>
                <CardTitle className="text-lg sm:text-xl">{publication.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1 flex-wrap text-xs sm:text-sm">
                  <Shield className="h-3 w-3 shrink-0" />
                  {publication.department}
                  <span className="text-muted-foreground">•</span>
                  <Clock className="h-3 w-3 shrink-0" />
                  {timeAgo}
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-safe/20 text-safe border-safe/30 shrink-0 text-xs sm:text-sm whitespace-nowrap">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground">{publication.description}</p>
          
          {publication.forecast_info && (
            <div className="p-3 sm:p-4 rounded-lg bg-secondary/30">
              <p className="text-xs sm:text-sm font-medium mb-1">Forecast</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{publication.forecast_info}</p>
            </div>
          )}

          {publication.recommendations && publication.recommendations.length > 0 && (
            <div>
              <p className="text-xs sm:text-sm font-medium mb-2">Recommendations</p>
              <ul className="space-y-1 sm:space-y-2">
                {publication.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Public Feedback Section */}
          <div className="pt-3 sm:pt-4 border-t border-border">
            <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Public Feedback</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <button
                onClick={() => onToggleReaction(publication.id, true)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                  userReaction === true
                    ? "bg-safe/30 text-safe"
                    : "bg-safe/10 text-safe hover:bg-safe/20"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="font-medium">{publication.likes_count}</span>
              </button>
              <button
                onClick={() => onToggleReaction(publication.id, false)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                  userReaction === false
                    ? "bg-danger/30 text-danger"
                    : "bg-danger/10 text-danger hover:bg-danger/20"
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="font-medium">{publication.dislikes_count}</span>
              </button>
              <button
                onClick={handleToggleComments}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-xs sm:text-sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">{publication.comments_count}</span>
              </button>
            </div>

            {showComments && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Textarea
                    placeholder="Share your feedback on this publication..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="bg-secondary/30 text-xs sm:text-sm"
                  />
                  <Button
                    size="icon"
                    className="shrink-0"
                    onClick={handleSubmitComment}
                    disabled={isSubmittingComment || !feedbackText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {loadingComments ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">Loading comments...</p>
                ) : comments.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-2 sm:p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium">{comment.author_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">No comments yet. Be the first to share your feedback!</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
