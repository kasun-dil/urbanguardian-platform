import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePublications, Publication, PublicationAlertType, PublicationSeverity } from "@/hooks/usePublications";

const formSchema = z.object({
  alert_type: z.enum([
    "weather_alert",
    "environmental_alert",
    "health_alert",
    "safety_alert",
    "infrastructure_alert",
    "general_announcement",
  ]),
  severity: z.enum(["low", "moderate", "high", "critical"]),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  department: z.string().min(2, "Department is required").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  forecast_info: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

const alertTypeLabels: Record<PublicationAlertType, string> = {
  weather_alert: "Weather Alert",
  environmental_alert: "Environmental Alert",
  health_alert: "Health Alert",
  safety_alert: "Safety Alert",
  infrastructure_alert: "Infrastructure Alert",
  general_announcement: "General Announcement",
};

const severityLabels: Record<PublicationSeverity, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
};

interface EditPublicationDialogProps {
  publication: Publication;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditPublicationDialog({ publication, children, onSuccess }: EditPublicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>(publication.recommendations || []);
  const [newRecommendation, setNewRecommendation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePublication } = usePublications();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alert_type: publication.alert_type,
      severity: publication.severity,
      title: publication.title,
      department: publication.department,
      description: publication.description,
      forecast_info: publication.forecast_info || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        alert_type: publication.alert_type,
        severity: publication.severity,
        title: publication.title,
        department: publication.department,
        description: publication.description,
        forecast_info: publication.forecast_info || "",
      });
      setRecommendations(publication.recommendations || []);
    }
  }, [open, publication, form]);

  const addRecommendation = () => {
    if (newRecommendation.trim() && recommendations.length < 10) {
      setRecommendations([...recommendations, newRecommendation.trim()]);
      setNewRecommendation("");
    }
  };

  const removeRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const { error } = await updatePublication(publication.id, {
      ...data,
      recommendations,
    });

    if (!error) {
      setOpen(false);
      onSuccess?.();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-1">
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Publication
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="alert_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select alert type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(alertTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(severityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter publication title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Department of Meteorology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed description..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="forecast_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forecast Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add forecast details if applicable..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Recommendations</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a recommendation point"
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRecommendation();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addRecommendation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {recommendations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recommendations.map((rec, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 py-1.5">
                      {rec}
                      <button
                        type="button"
                        onClick={() => removeRecommendation(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
