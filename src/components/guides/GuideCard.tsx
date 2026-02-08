import { motion } from "framer-motion";
import { BookOpen, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type PreparednessGuide, categoryLabels, relevanceLabels } from "@/hooks/usePreparednessGuides";

interface GuideCardProps {
  guide: PreparednessGuide;
  index?: number;
  onReadGuide?: (guide: PreparednessGuide) => void;
}

export function GuideCard({ guide, index = 0, onReadGuide }: GuideCardProps) {
  const relevanceColors = {
    low: "bg-secondary text-muted-foreground",
    medium: "bg-warning/20 text-warning",
    high: "bg-danger/20 text-danger",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2 line-clamp-2">{guide.title}</h3>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {categoryLabels[guide.category]}
            </Badge>
            <Badge className={`text-xs ${relevanceColors[guide.relevance]}`}>
              {relevanceLabels[guide.relevance]} Relevance
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Last updated: {formatDistanceToNow(new Date(guide.updated_at), { addSuffix: true })}
          </p>
          <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10" onClick={() => onReadGuide?.(guide)}>
            Read Guide
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
