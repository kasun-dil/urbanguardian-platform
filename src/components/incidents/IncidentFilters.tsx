import {
  Droplets,
  Car,
  TreeDeciduous,
  AlertOctagon,
  AlertTriangle,
  Map,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const incidentTypes = [
  { value: "flooding", label: "Flooding", icon: Droplets, color: "text-primary" },
  { value: "blocked_road", label: "Blocked Road", icon: Car, color: "text-warning" },
  { value: "fallen_tree", label: "Fallen Tree", icon: TreeDeciduous, color: "text-safe" },
  { value: "hazard", label: "Hazard Zone", icon: AlertOctagon, color: "text-danger" },
  { value: "other", label: "Other", icon: AlertTriangle, color: "text-muted-foreground" },
];

interface IncidentFiltersProps {
  filter: string;
  view: "map" | "feed";
  onFilterChange: (filter: string) => void;
  onViewChange: (view: "map" | "feed") => void;
}

export function IncidentFilters({
  filter,
  view,
  onFilterChange,
  onViewChange,
}: IncidentFiltersProps) {
  return (
    <div className="border-b border-border bg-card/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange("all")}
            >
              All
            </Button>
            {incidentTypes.map((type) => (
              <Button
                key={type.value}
                variant={filter === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(type.value)}
                className="gap-1"
              >
                <type.icon className={`h-3 w-3 ${type.color}`} />
                {type.label}
              </Button>
            ))}
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange("active")}
            >
              Active Only
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => onViewChange(v as "map" | "feed")}>
              <TabsList className="bg-secondary">
                <TabsTrigger value="map" className="gap-1">
                  <Map className="h-4 w-4" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="feed" className="gap-1">
                  <List className="h-4 w-4" />
                  Feed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
