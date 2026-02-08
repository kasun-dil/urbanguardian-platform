import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { type PreparednessGuide, categoryLabels, relevanceLabels } from "@/hooks/usePreparednessGuides";

interface GuideDetailModalProps {
  guide: PreparednessGuide | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GuideDetailModal({ guide, isOpen, onClose }: GuideDetailModalProps) {
  if (!guide) return null;

  const relevanceColors = {
    low: "bg-secondary text-muted-foreground",
    medium: "bg-warning/20 text-warning",
    high: "bg-danger/20 text-danger",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-grow">
              <DialogTitle className="text-xl">{guide.title}</DialogTitle>
              <DialogDescription className="mt-1">
                Last updated: {formatDistanceToNow(new Date(guide.updated_at), { addSuffix: true })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {categoryLabels[guide.category]}
            </Badge>
            <Badge className={`text-xs ${relevanceColors[guide.relevance]}`}>
              {relevanceLabels[guide.relevance]} Relevance
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Guide Content</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{guide.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
