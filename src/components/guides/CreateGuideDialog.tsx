import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePreparednessGuides, categoryLabels, relevanceLabels } from "@/hooks/usePreparednessGuides";
import type { Database } from "@/integrations/supabase/types";

type GuideCategory = Database["public"]["Enums"]["guide_category"];
type GuideRelevance = Database["public"]["Enums"]["guide_relevance"];

export function CreateGuideDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createGuide } = usePreparednessGuides();

  const [formData, setFormData] = useState({
    title: "",
    category: "" as GuideCategory | "",
    relevance: "medium" as GuideRelevance,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description) {
      return;
    }

    setIsSubmitting(true);
    const success = await createGuide({
      title: formData.title,
      category: formData.category as GuideCategory,
      relevance: formData.relevance,
      description: formData.description,
    });

    setIsSubmitting(false);
    
    if (success) {
      setOpen(false);
      setFormData({
        title: "",
        category: "",
        relevance: "medium",
        description: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Preparedness Guide</DialogTitle>
            <DialogDescription>
              Create a new preparedness guide to help citizens prepare for emergencies.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Flood Preparedness Guide"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: GuideCategory) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relevance">Relevance *</Label>
                <Select
                  value={formData.relevance}
                  onValueChange={(value: GuideRelevance) =>
                    setFormData({ ...formData, relevance: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(relevanceLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about this preparedness guide..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title || !formData.category || !formData.description}>
              {isSubmitting ? "Creating..." : "Create Guide"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
