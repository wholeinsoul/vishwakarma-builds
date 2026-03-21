"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeGrid } from "./ThemeGrid";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FALLBACK_THEMES } from "@/lib/themes";
import type { PlanWizardData } from "@/types";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";

const VENUE_OPTIONS = [
  { value: "backyard", label: "Backyard", emoji: "🏡" },
  { value: "park", label: "Park", emoji: "🌳" },
  { value: "indoor", label: "Indoor Space", emoji: "🏠" },
  { value: "venue", label: "Party Venue", emoji: "🎪" },
  { value: "restaurant", label: "Restaurant", emoji: "🍕" },
] as const;

const STEPS = ["Theme", "Child Details", "Party Details", "Review"] as const;

export function PlanWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlanWizardData>({
    theme: "",
    child_name: "",
    child_age: 5,
    title: "",
    headcount: 10,
    budget: null,
    venue_type: "backyard",
    party_date: null,
    dietary_notes: null,
  });

  const updateField = <K extends keyof PlanWizardData>(key: K, value: PlanWizardData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const selectedTheme = FALLBACK_THEMES.find((t) => t.slug === formData.theme);

  const canProceed = () => {
    switch (step) {
      case 0: return formData.theme !== "";
      case 1: return formData.child_name !== "" && formData.child_age >= 1;
      case 2: return formData.headcount >= 1;
      case 3: return true;
      default: return false;
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Auto-generate title if empty
      const title = formData.title || `${formData.child_name}'s ${selectedTheme?.name || formData.theme} Party`;
      const payload = { ...formData, title };

      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 402) {
        // Need to pay - redirect to checkout
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
          return;
        }
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate plan");
      }

      const data = await res.json();
      router.push(`/plan/${data.party_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div
                className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  i <= step
                    ? "bg-party-pink text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs ${i <= step ? "text-party-pink font-medium" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-party-pink to-party-purple transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Theme Selection */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Party Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeGrid
              selectedTheme={formData.theme}
              onSelect={(slug) => updateField("theme", slug)}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2: Child Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Tell Us About the Birthday Star</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="child_name">Child&apos;s Name</Label>
              <Input
                id="child_name"
                value={formData.child_name}
                onChange={(e) => updateField("child_name", e.target.value)}
                placeholder="e.g., Jake"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="child_age">Age Turning</Label>
              <Input
                id="child_age"
                type="number"
                min={1}
                max={18}
                value={formData.child_age}
                onChange={(e) => updateField("child_age", parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="title">Party Title (optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={`${formData.child_name || "Your child"}'s ${selectedTheme?.name || ""} Party`}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Party Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Party Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="headcount">Number of Kids</Label>
              <Input
                id="headcount"
                type="number"
                min={1}
                max={100}
                value={formData.headcount}
                onChange={(e) => updateField("headcount", parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Venue</Label>
              <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {VENUE_OPTIONS.map((venue) => (
                  <button
                    key={venue.value}
                    type="button"
                    onClick={() => updateField("venue_type", venue.value)}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      formData.venue_type === venue.value
                        ? "border-party-pink bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl">{venue.emoji}</span>
                    <p className="text-sm font-medium">{venue.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="budget">Budget ($) (optional)</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                value={formData.budget ? formData.budget / 100 : ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateField("budget", val ? Math.round(val * 100) : null);
                }}
                placeholder="e.g., 200"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="party_date">Party Date (optional)</Label>
              <Input
                id="party_date"
                type="date"
                value={formData.party_date || ""}
                onChange={(e) => updateField("party_date", e.target.value || null)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dietary_notes">Dietary Notes (optional)</Label>
              <Textarea
                id="dietary_notes"
                value={formData.dietary_notes || ""}
                onChange={(e) => updateField("dietary_notes", e.target.value || null)}
                placeholder="e.g., 2 kids nut-free, 1 vegetarian"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Party Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedTheme?.emoji}</span>
                <div>
                  <h3 className="font-bold text-lg">
                    {formData.title || `${formData.child_name}'s ${selectedTheme?.name} Party`}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedTheme?.name} Theme</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">Birthday Star</p>
                  <p className="font-semibold">{formData.child_name}, turning {formData.child_age}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">Guest Count</p>
                  <p className="font-semibold">{formData.headcount} kids</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">Venue</p>
                  <p className="font-semibold capitalize">
                    {VENUE_OPTIONS.find((v) => v.value === formData.venue_type)?.emoji}{" "}
                    {VENUE_OPTIONS.find((v) => v.value === formData.venue_type)?.label}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-semibold">
                    {formData.budget ? `$${(formData.budget / 100).toFixed(0)}` : "Flexible"}
                  </p>
                </div>
              </div>
              {formData.party_date && (
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-semibold">{new Date(formData.party_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              )}
              {formData.dietary_notes && (
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">Dietary Notes</p>
                  <p className="font-semibold">{formData.dietary_notes}</p>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="bg-party-pink hover:bg-pink-600"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-gradient-to-r from-party-pink to-party-purple hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate My Plan
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
