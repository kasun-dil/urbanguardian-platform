import { motion } from "framer-motion";
import { MapPin, ThumbsUp, ThumbsDown, MessageCircle, CheckCircle2, Shield, Package, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { DonationCenter } from "@/hooks/useDonationCenters";

interface DonationCenterCardProps {
  center: DonationCenter;
  index: number;
  onViewDetails: (center: DonationCenter) => void;
  onDonateNow: (center: DonationCenter) => void;
  isOwner?: boolean;
}

export function DonationCenterCard({ center, index, onViewDetails, onDonateNow, isOwner = false }: DonationCenterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:border-primary/50 transition-all duration-200">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base sm:text-lg">{center.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{center.location}</span>
                </CardDescription>
              </div>
            </div>
            <div className="text-right shrink-0 w-full sm:w-auto">
              <Badge className={`${center.status === "active" ? "bg-safe/20 text-safe border-safe/30" : "bg-muted"} text-xs sm:text-sm`}>
                {center.status === "active" ? "Active" : "Inactive"}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(center.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {center.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{center.description}</p>
          )}

          {/* Verification badges */}
          <div className="flex flex-wrap gap-2">
            {center.is_government_verified && (
              <Badge variant="outline" className="gap-1 border-primary/30 text-primary text-xs">
                <Shield className="h-3 w-3" />
                Gov Verified
              </Badge>
            )}
            {center.is_admin_verified && (
              <Badge variant="outline" className="gap-1 border-safe/30 text-safe text-xs">
                <CheckCircle2 className="h-3 w-3" />
                Admin Verified
              </Badge>
            )}
            {!center.is_government_verified && !center.is_admin_verified && (
              <Badge variant="outline" className="gap-1 border-warning/30 text-warning text-xs">
                Pending Verification
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              {center.likes_count}
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4" />
              {center.dislikes_count}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {center.comments_count}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" className="flex-1 gap-2 text-sm sm:text-base" onClick={() => onViewDetails(center)}>
              {isOwner && <Settings className="h-4 w-4" />}
              {isOwner ? "Manage Center" : "View Details"}
            </Button>
            <Button className="flex-1 bg-gradient-primary text-sm sm:text-base" onClick={() => onDonateNow(center)}>
              Donate Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
