import { useState, useEffect } from "react";
import { Plus, LogIn, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LocationPickerMap } from "./LocationPickerMap";
import type { CreateIncidentData } from "@/hooks/useIncidents";
import type { Database } from "@/integrations/supabase/types";

type IncidentType = Database["public"]["Enums"]["incident_type"];
type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];

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

interface ReportIncidentDialogProps {
  onSubmit: (data: CreateIncidentData) => Promise<boolean>;
}

export function ReportIncidentDialog({ onSubmit }: ReportIncidentDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "" as IncidentType | "",
    title: "",
    description: "",
    location: "",
    severity: "" as IncidentSeverity | "",
  });
  const [coordinates, setCoordinates] = useState({
    lat: 6.9271,
    lng: 79.8612,
  });
  const [locationSet, setLocationSet] = useState(false);

  // Get user's current location when dialog opens
  useEffect(() => {
    if (open && !locationSet) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoordinates({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.log("Geolocation error:", error);
            // Keep default coordinates
          },
          { enableHighAccuracy: true }
        );
      }
    }
  }, [open, locationSet]);

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <Button 
        className="gap-2 bg-gradient-primary hover:opacity-90"
        onClick={() => {
          toast.info("Please sign in to report an incident");
          navigate("/login");
        }}
      >
        <LogIn className="h-4 w-4" />
        Sign in to Report
      </Button>
    );
  }

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setCoordinates({ lat, lng });
    setLocationSet(true);
    if (address) {
      // Truncate address if too long
      const truncatedAddress = address.length > 100 ? address.substring(0, 100) + "..." : address;
      setFormData((prev) => ({ ...prev, location: truncatedAddress }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.title || !formData.location || !formData.severity) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!locationSet) {
      toast.error("Please select a location on the map");
      return;
    }

    setLoading(true);

    const success = await onSubmit({
      type: formData.type as IncidentType,
      title: formData.title,
      description: formData.description || undefined,
      location: formData.location,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      severity: formData.severity as IncidentSeverity,
    });

    setLoading(false);

    if (success) {
      setOpen(false);
      setFormData({
        type: "",
        title: "",
        description: "",
        location: "",
        severity: "",
      });
      setLocationSet(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        type: "",
        title: "",
        description: "",
        location: "",
        severity: "",
      });
      setLocationSet(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4" />
          Report Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <DialogTitle>Report New Incident</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Incident Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as IncidentType }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location *
            </Label>
            <LocationPickerMap
              initialLat={coordinates.lat}
              initialLng={coordinates.lng}
              onLocationChange={handleLocationChange}
            />
            <Input
              placeholder="Location address will appear here..."
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              className="mt-2"
            />
            {locationSet && (
              <p className="text-xs text-muted-foreground">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the incident in detail..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Severity *</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, severity: value as IncidentSeverity }))}
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

          <Button
            className="w-full bg-gradient-primary"
            onClick={handleSubmit}
            disabled={loading || !formData.type || !formData.title || !formData.location || !formData.severity || !locationSet}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
