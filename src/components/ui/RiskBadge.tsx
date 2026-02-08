import { cn } from "@/lib/utils";

export type RiskLevel = "safe" | "low" | "moderate" | "high" | "critical";

interface RiskBadgeProps {
  level: RiskLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const riskConfig: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  safe: {
    label: "Safe",
    color: "text-safe",
    bgColor: "bg-safe/20",
  },
  low: {
    label: "Low",
    color: "text-safe",
    bgColor: "bg-safe/20",
  },
  moderate: {
    label: "Moderate",
    color: "text-warning",
    bgColor: "bg-warning/20",
  },
  high: {
    label: "High",
    color: "text-danger",
    bgColor: "bg-danger/20",
  },
  critical: {
    label: "Critical",
    color: "text-critical",
    bgColor: "bg-critical/20",
  },
};

const sizeConfig = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function RiskBadge({ level, showLabel = true, size = "md", className }: RiskBadgeProps) {
  const config = riskConfig[level];
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "rounded-full",
          sizeConfig[size],
          config.color,
          "bg-current"
        )}
      />
      {showLabel && (
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export function RiskBadgePill({ level, className }: { level: RiskLevel; className?: string }) {
  const config = riskConfig[level] || riskConfig.safe; // Fallback to safe if level is invalid
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bgColor,
        config.color,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
