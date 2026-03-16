"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { NavHeader } from "@/components/dashboard/nav-header";
import { SwitchStatus } from "@/components/dashboard/switch-status";
import { CheckInButton } from "@/components/dashboard/check-in-button";
import {
  BeneficiaryList,
  type Beneficiary,
} from "@/components/dashboard/beneficiary-list";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  Shield,
  Plus,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  CalendarCheck,
} from "lucide-react";

interface Plan {
  id: string;
  title: string;
  status: "active" | "paused" | "triggered" | "disabled";
  check_in_interval_days: number;
  next_check_in: string | null;
  last_check_in: string | null;
  beneficiaries: Beneficiary[];
}

const statusBadgeConfig: Record<
  Plan["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  triggered: {
    label: "Triggered",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  disabled: {
    label: "Disabled",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days > 1) return `in ${days} days`;
  if (days === 1) return "tomorrow";
  if (days === 0) return "today";
  if (days === -1) return "overdue by 1 day";
  return `overdue by ${Math.abs(days)} days`;
}

export default function DashboardPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load plans");
      }
      const data = await res.json();
      setPlans(data.plans ?? data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCheckInComplete = (planId: string, nextCheckIn: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              next_check_in: nextCheckIn,
              last_check_in: new Date().toISOString(),
            }
          : plan
      )
    );
    toast({
      title: "Check-in successful",
      description: `Next check-in: ${new Date(nextCheckIn).toLocaleDateString()}`,
    });
  };

  const handleCheckInError = (error: string) => {
    toast({
      title: "Check-in failed",
      description: error,
      variant: "destructive",
    });
  };

  const handleBeneficiaryAdded = (planId: string, beneficiary: Beneficiary) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? { ...plan, beneficiaries: [...plan.beneficiaries, beneficiary] }
          : plan
      )
    );
  };

  const handleBeneficiaryRemoved = (planId: string, beneficiaryId: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              beneficiaries: plan.beneficiaries.filter(
                (b) => b.id !== beneficiaryId
              ),
            }
          : plan
      )
    );
  };

  const toggleBeneficiaries = (planId: string) => {
    setExpandedPlanId((prev) => (prev === planId ? null : planId));
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your recovery plans and check-ins
            </p>
          </div>
          <Button asChild>
            <Link href="/create">
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Link>
          </Button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your plans...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center py-10">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="font-semibold text-lg mb-1">
                Failed to load plans
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={fetchPlans}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !error && plans.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">
                No recovery plans yet
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Create your first recovery plan to protect your crypto assets.
                Your beneficiaries will receive step-by-step instructions if
                something happens to you.
              </p>
              <Button asChild size="lg">
                <Link href="/create">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Recovery Plan
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plan cards */}
        {!loading && !error && plans.length > 0 && (
          <div className="space-y-6">
            {plans.map((plan) => {
              const badge = statusBadgeConfig[plan.status];
              const isExpanded = expandedPlanId === plan.id;

              return (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle className="text-xl truncate">
                            {plan.title}
                          </CardTitle>
                          <Badge className={badge.className}>
                            {badge.label}
                          </Badge>
                        </div>
                        <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Every {plan.check_in_interval_days} days
                          </span>
                          {plan.next_check_in && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarCheck className="h-3.5 w-3.5" />
                              Next: {formatRelativeDate(plan.next_check_in)}
                            </span>
                          )}
                          {plan.last_check_in && (
                            <span>
                              Last check-in:{" "}
                              {new Date(
                                plan.last_check_in
                              ).toLocaleDateString()}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {plan.beneficiaries.length}{" "}
                            {plan.beneficiaries.length === 1
                              ? "beneficiary"
                              : "beneficiaries"}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Dead man's switch status */}
                    <SwitchStatus
                      status={plan.status}
                      nextCheckIn={plan.next_check_in}
                      lastCheckIn={plan.last_check_in}
                      checkInIntervalDays={plan.check_in_interval_days}
                    />

                    {/* Check-in button */}
                    <CheckInButton
                      planId={plan.id}
                      status={plan.status}
                      onCheckInComplete={(nextCheckIn) =>
                        handleCheckInComplete(plan.id, nextCheckIn)
                      }
                      onError={handleCheckInError}
                    />

                    <Separator />

                    {/* View Beneficiaries toggle */}
                    <button
                      onClick={() => toggleBeneficiaries(plan.id)}
                      className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        View Beneficiaries ({plan.beneficiaries.length})
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {/* Beneficiary list (expandable) */}
                    {isExpanded && (
                      <div className="pt-2">
                        <BeneficiaryList
                          planId={plan.id}
                          beneficiaries={plan.beneficiaries}
                          onBeneficiaryAdded={(ben) =>
                            handleBeneficiaryAdded(plan.id, ben)
                          }
                          onBeneficiaryRemoved={(benId) =>
                            handleBeneficiaryRemoved(plan.id, benId)
                          }
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
