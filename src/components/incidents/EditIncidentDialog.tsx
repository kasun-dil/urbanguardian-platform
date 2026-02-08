import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { geocodeAddress, getFallbackCoordinates } from "@/lib/geocoding";
import type { Incident } from "@/hooks/useIncidents";
import type { UpdateIncidentData } from "@/hooks/useUserIncidents";
import type { Database } from "@/integrations/supabase/types";

type IncidentType = Database["public"]["Enums"]["incident_type"];
type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];

interface IncidentTypeOption {
  value: IncidentType;
  label: string;
}

const incidentTypes: IncidentTypeOption[] = [
  { value: "flooding", label: "Flooding" },
  { value: "blocked_road", label: "Blocked Road" },
  { value: "fallen_tree", label: "Fallen Tree" },
  { value: "hazard", label: "Hazard Zone" },
  { value: "other", label: "Other" },
];

interface EditIncidentDialogProps {
  incident: Incident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateIncidentData) => Promise<boolean>;
}

export function EditIncidentDialog({ 
  incident, 
  open, 
  onOpenChange, 
  onSubmit 
}: EditIncidentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: incident.type,
    title: incident.title,
    description: incident.description || "",
    location: incident.location,
    severity: incident.severity,
    status: incident.status,
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.location) return;

    setLoading(true);

    // Geocode the address if location changed
    let latitude = incident.latitude;
    let longitude = incident.longitude;

    if (formData.location !== incident.location) {
      const geocoded = await geocodeAddress(formData.location);
      if (geocoded) {
        latitude = geocoded.lat;
        longitude = geocoded.lng;
      } else {
        const fallback = getFallbackCoordinates();
        latitude = fallback.lat;
        longitude = fallback.lng;
      }
    }

    const success = await onSubmit({
      id: incident.id,
      type: formData.type,
      title: formData.title,
      description: formData.description || undefined,
      location: formData.location,
      latitude,
      longitude,
      severity: formData.severity,
      status: formData.status,
    });

    setLoading(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md z-[100]">
        <DialogHeader>
          <DialogTitle>Edit Incident</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Incident Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => 
                setFormData((prev) => ({ ...prev, type: value as IncidentType }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[101]">
                {incidentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="Brief title for the incident"
              value={formData.title}
              onChange={(e) => 
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Location *</Label>
            <Input
              placeholder="Enter location (e.g., Main Road, Colombo 03)"
              value={formData.location}
              onChange={(e) => 
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the incident in detail..."
              value={formData.description}
              onChange={(e) => 
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => 
                  setFormData((prev) => ({ ...prev, severity: value as IncidentSeverity }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent className="z-[101]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => 
                  setFormData((prev) => ({ ...prev, status: value as IncidentStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[101]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="w-full bg-gradient-primary"
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.location}
          >
            {loading ? "Updating..." : "Update Incident"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
