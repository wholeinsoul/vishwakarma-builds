"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

interface SwitchStatusProps {
  status: "active" | "paused" | "triggered" | "disabled";
  nextCheckIn: string | null;
  lastCheckIn: string | null;
  checkInIntervalDays: number;
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatRelativeDate(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  if (days > 1) return `in ${days} days`;
  if (days === 1) return "tomorrow";
  if (days === 0) return "today";
  if (days === -1) return "overdue by 1 day";
  return `overdue by ${Math.abs(days)} days`;
}

export function SwitchStatus({
  status,
  nextCheckIn,
  lastCheckIn,
  checkInIntervalDays,
}: SwitchStatusProps) {
  const { daysUntil, percentRemaining, colorClass, bgColorClass, indicatorColorClass } = useMemo(() => {
    if (!nextCheckIn || status !== "active") {
      return {
        daysUntil: 0,
        percentRemaining: 0,
        colorClass: "text-muted-foreground",
        bgColorClass: "bg-muted",
        indicatorColorClass: "",
      };
    }

    const days = getDaysUntil(nextCheckIn);
    const percent = Math.max(0, Math.min(100, (days / checkInIntervalDays) * 100));

    let color = "text-emerald-600";
    let bgColor = "bg-emerald-50";
    let indicatorColor = "[&>div]:bg-emerald-500";

    if (days <= 0) {
      color = "text-red-600";
      bgColor = "bg-red-50";
      indicatorColor = "[&>div]:bg-red-500";
    } else if (percent < 50) {
      color = "text-amber-600";
      bgColor = "bg-amber-50";
      indicatorColor = "[&>div]:bg-amber-500";
    }

    return {
      daysUntil: days,
      percentRemaining: percent,
      colorClass: color,
      bgColorClass: bgColor,
      indicatorColorClass: indicatorColor,
    };
  }, [nextCheckIn, checkInIntervalDays, status]);

  if (status !== "active") {
    const statusConfig = {
      paused: {
        icon: Clock,
        label: "Switch Paused",
        description: "Check-ins are paused. Reactivate your plan to resume.",
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      triggered: {
        icon: AlertTriangle,
        label: "Switch Triggered",
        description: "Beneficiaries have been notified with access to the recovery plan.",
        color: "text-red-600",
        bg: "bg-red-50",
      },
      disabled: {
        icon: XCircle,
        label: "Switch Disabled",
        description: "This plan is disabled. No check-ins or notifications will occur.",
        color: "text-gray-500",
        bg: "bg-gray-50",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={cn("rounded-lg p-4", config.bg)}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("h-4 w-4", config.color)} />
          <span className={cn("text-sm font-semibold", config.color)}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg p-4", bgColorClass)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle className={cn("h-4 w-4", colorClass)} />
          <span className={cn("text-sm font-semibold", colorClass)}>
            Dead Man&apos;s Switch Active
          </span>
        </div>
        {nextCheckIn && (
          <span className={cn("text-xs font-medium", colorClass)}>
            {formatRelativeDate(nextCheckIn)}
          </span>
        )}
      </div>

      <Progress
        value={percentRemaining}
        className={cn("h-2", indicatorColorClass)}
      />

      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>
          {lastCheckIn
            ? `Last check-in: ${new Date(lastCheckIn).toLocaleDateString()}`
            : "No check-ins yet"}
        </span>
        <span>Every {checkInIntervalDays} days</span>
      </div>
    </div>
  );
}
