import { Phone, MapPin, Package, Shield, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { DonationCenter } from "@/hooks/useDonationCenters";

interface DonateNowModalProps {
  center: DonationCenter | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DonateNowModal({ center, isOpen, onClose }: DonateNowModalProps) {
  if (!center) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle>Donate to {center.name}</DialogTitle>
              <DialogDescription>
                Contact the center to arrange your donation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Verification badges */}
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
                Not Yet Verified
              </Badge>
            )}
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">{center.location}</p>
            </div>
          </div>

          <Separator />

          {/* Phone Numbers */}
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Numbers
            </p>
            <div className="space-y-2">
              {center.phone_numbers.length > 0 ? (
                center.phone_numbers.map((phone, index) => (
                  <a
                    key={index}
                    href={`tel:${phone}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
                  >
                    <span className="font-medium">{phone}</span>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No contact numbers available
                </p>
              )}
            </div>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground text-center">
            Please call ahead to confirm the center's operating hours and what donations they are currently accepting.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
