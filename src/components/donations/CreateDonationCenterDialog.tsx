import { useState } from "react";
import { Plus, MapPin, Phone, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUserDonationCenters } from "@/hooks/useDonationCenters";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreateDonationCenterDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateDonationCenterDialog({ trigger, onSuccess }: CreateDonationCenterDialogProps) {
  const { user } = useAuth();
  const { createCenter } = useUserDonationCenters();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    phoneNumbers: [] as string[],
    currentPhone: "",
  });

  const handleAddPhone = () => {
    if (formData.currentPhone && !formData.phoneNumbers.includes(formData.currentPhone)) {
      setFormData(prev => ({
        ...prev,
        phoneNumbers: [...prev.phoneNumbers, prev.currentPhone],
        currentPhone: "",
      }));
    }
  };

  const handleRemovePhone = (phone: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.filter(p => p !== phone),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to create a donation center");
      return;
    }

    if (!formData.name || !formData.location || !formData.latitude || !formData.longitude) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.phoneNumbers.length === 0) {
      toast.error("Please add at least one contact phone number");
      return;
    }

    setLoading(true);
    const result = await createCenter({
      name: formData.name,
      description: formData.description || null,
      location: formData.location,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      phone_numbers: formData.phoneNumbers,
    });

    setLoading(false);

    if (result) {
      setFormData({
        name: "",
        description: "",
        location: "",
        latitude: "",
        longitude: "",
        phoneNumbers: [],
        currentPhone: "",
      });
      setOpen(false);
      onSuccess?.();
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          toast.success("Location captured!");
        },
        () => {
          toast.error("Unable to get your location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Register New Center
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Donation Center</DialogTitle>
          <DialogDescription>
            Create a new donation center to collect and distribute resources.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Center Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Maharagama Youth Donation Center"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your center collects and distributes..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location Address *</Label>
            <Input
              id="location"
              placeholder="e.g., No. 45, Main Street, Maharagama"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="6.8497"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="79.9265"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                required
              />
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleGetCurrentLocation}
          >
            <MapPin className="h-4 w-4" />
            Use My Current Location
          </Button>

          <div className="space-y-2">
            <Label>Contact Phone Numbers *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="+94 77 123 4567"
                value={formData.currentPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPhone: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPhone();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddPhone}>
                <Phone className="h-4 w-4" />
              </Button>
            </div>
            {formData.phoneNumbers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.phoneNumbers.map((phone) => (
                  <Badge key={phone} variant="secondary" className="gap-1 pr-1">
                    {phone}
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(phone)}
                      className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Center"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
