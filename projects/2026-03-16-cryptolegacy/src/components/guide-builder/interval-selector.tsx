"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  platformTemplates,
  type PlatformTemplate,
} from "@/lib/templates";
import type { Beneficiary } from "@/lib/validations";

interface IntervalSelectorProps {
  checkInInterval: number;
  onIntervalChange: (interval: number) => void;
  /** Summary data for the review section */
  selectedPlatforms: string[];
  beneficiaries: Beneficiary[];
}

const INTERVAL_OPTIONS = [
  {
    value: 30,
    label: "30 days",
    description: "Check in every 30 days. Best for active traders.",
  },
  {
    value: 60,
    label: "60 days",
    description: "Check in every 60 days. Good balance for most users.",
  },
  {
    value: 90,
    label: "90 days",
    description: "Check in every 90 days. Suitable for long-term holders.",
  },
  {
    value: 180,
    label: "180 days",
    description: "Check in every 6 months. For set-and-forget portfolios.",
  },
  {
    value: 365,
    label: "365 days",
    description: "Check in once a year. Minimum maintenance.",
  },
];

export function IntervalSelector({
  checkInInterval,
  onIntervalChange,
  selectedPlatforms,
  beneficiaries,
}: IntervalSelectorProps) {
  const platforms = selectedPlatforms
    .map((id) => platformTemplates.find((t) => t.id === id))
    .filter(Boolean) as PlatformTemplate[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Set Check-in Interval</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how often you need to check in. If you miss a check-in, your
          beneficiaries will be notified through an escalation chain.
        </p>
      </div>

      {/* Interval radio group */}
      <RadioGroup
        value={String(checkInInterval)}
        onValueChange={(val) => onIntervalChange(Number(val))}
        className="space-y-3"
      >
        {INTERVAL_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
          >
            <RadioGroupItem
              value={String(option.value)}
              id={`interval-${option.value}`}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium">{option.label}</span>
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            </div>
          </label>
        ))}
      </RadioGroup>

      {/* Escalation chain explanation */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-200">
            Escalation Chain
          </p>
          <ol className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
            <li className="flex items-start gap-2">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
              >
                1
              </Badge>
              <span>
                <strong>Reminder</strong> — You receive a reminder on the day
                your check-in is due.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
              >
                2
              </Badge>
              <span>
                <strong>Urgent</strong> — If 7 days pass without a check-in,
                you receive urgent notifications via email and SMS.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
              >
                3
              </Badge>
              <span>
                <strong>Trigger</strong> — After 14 days overdue, your recovery
                plan is sent to your beneficiaries automatically.
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Plan summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Platforms</span>
            <span className="text-sm font-medium">
              {platforms.map((p) => `${p.icon} ${p.name}`).join(", ")}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Beneficiaries</span>
            <span className="text-sm font-medium">
              {beneficiaries.map((b) => b.name).join(", ")}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Check-in interval</span>
            <span className="text-sm font-medium">
              Every {checkInInterval} days
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Trigger if inactive for
            </span>
            <span className="text-sm font-medium">
              {checkInInterval + 14} days
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
