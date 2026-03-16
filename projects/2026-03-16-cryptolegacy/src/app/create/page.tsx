"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { encrypt } from "@/lib/crypto";
import {
  platformTemplates,
  type PlatformTemplate,
} from "@/lib/templates";
import { passphraseSchema } from "@/lib/validations";
import type { Beneficiary } from "@/lib/validations";

import { PlatformSelector } from "@/components/guide-builder/platform-selector";
import { DetailForm } from "@/components/guide-builder/detail-form";
import { BeneficiaryForm } from "@/components/guide-builder/beneficiary-form";
import { PassphraseSetup } from "@/components/guide-builder/passphrase-setup";
import { IntervalSelector } from "@/components/guide-builder/interval-selector";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_LABELS = [
  "Platforms",
  "Details",
  "Beneficiaries",
  "Passphrase",
  "Check-in",
] as const;

const TOTAL_STEPS = STEP_LABELS.length;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function CreatePlanPage() {
  const router = useRouter();

  // ---- Wizard state ----
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformData, setPlatformData] = useState<
    Record<string, Record<string, string>>
  >({});
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [checkInInterval, setCheckInInterval] = useState(90);

  // ---- Submission state ----
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ---- Derived helpers ----
  const progressPercent = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const templates = useMemo(
    () =>
      selectedPlatforms
        .map((id) => platformTemplates.find((t) => t.id === id))
        .filter(Boolean) as PlatformTemplate[],
    [selectedPlatforms]
  );

  // ---- Platform data handler ----
  const handlePlatformDataChange = useCallback(
    (platformId: string, fieldId: string, value: string) => {
      setPlatformData((prev) => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          [fieldId]: value,
        },
      }));
    },
    []
  );

  // ---- Step validation ----
  function canProceed(): boolean {
    switch (currentStep) {
      case 0:
        return selectedPlatforms.length > 0;
      case 1: {
        // All required fields for every selected platform must be filled
        for (const template of templates) {
          for (const field of template.fields) {
            if (field.required) {
              const value = platformData[template.id]?.[field.id]?.trim();
              if (!value) return false;
            }
          }
        }
        return true;
      }
      case 2:
        return beneficiaries.length > 0;
      case 3: {
        const result = passphraseSchema.safeParse(passphrase);
        return result.success && passphrase === confirmPassphrase;
      }
      case 4:
        return checkInInterval > 0;
      default:
        return false;
    }
  }

  // ---- Navigation ----
  function goNext() {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  // ---- Submit plan ----
  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build the plaintext payload from platform data + recovery steps
      const planPayload = selectedPlatforms.map((id) => {
        const template = platformTemplates.find((t) => t.id === id);
        return {
          platformId: id,
          platformName: template?.name ?? id,
          data: platformData[id] ?? {},
          recoverySteps: template?.recoverySteps ?? [],
        };
      });

      const plaintext = JSON.stringify(planPayload);

      // Encrypt client-side
      const { ciphertext, iv, salt } = await encrypt(plaintext, passphrase);

      // Build the plan title from selected platform names
      const title = templates.map((t) => t.name).join(" + ") + " Recovery Plan";

      // POST to API
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          encrypted_blob: ciphertext,
          encryption_iv: iv,
          encryption_salt: salt,
          check_in_interval_days: checkInInterval,
          template_ids: selectedPlatforms,
          beneficiaries,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error ?? `Server responded with ${res.status}`
        );
      }

      setIsSuccess(true);

      // Redirect after a short delay so the user sees the success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 4000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---- Success screen ----
  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
          <CardContent className="space-y-4 p-8 text-center">
            <div className="text-4xl" aria-hidden="true">
              OK
            </div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
              Recovery Plan Created
            </h2>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your plan has been encrypted and saved. You will be redirected
              to your dashboard shortly.
            </p>
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-sm font-bold text-destructive">
                  IMPORTANT: Remember Your Passphrase
                </p>
                <p className="mt-2 text-sm text-destructive/90">
                  There is no way to reset or recover your passphrase. Make
                  sure you have shared it with your beneficiaries in person,
                  by phone, or in a sealed envelope. Without it, your
                  encrypted recovery data is permanently inaccessible.
                </p>
              </CardContent>
            </Card>
            <Button
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Wizard UI ----
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Recovery Plan
        </h1>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Step {currentStep + 1} of {TOTAL_STEPS}:{" "}
              <span className="text-foreground">
                {STEP_LABELS[currentStep]}
              </span>
            </span>
            <span className="text-muted-foreground">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, index) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`hidden text-xs sm:block ${
                  index <= currentStep
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <PlatformSelector
            selectedPlatforms={selectedPlatforms}
            onSelectionChange={setSelectedPlatforms}
          />
        )}

        {currentStep === 1 && (
          <DetailForm
            selectedPlatforms={selectedPlatforms}
            platformData={platformData}
            onDataChange={handlePlatformDataChange}
          />
        )}

        {currentStep === 2 && (
          <BeneficiaryForm
            beneficiaries={beneficiaries}
            onBeneficiariesChange={setBeneficiaries}
          />
        )}

        {currentStep === 3 && (
          <PassphraseSetup
            passphrase={passphrase}
            onPassphraseChange={setPassphrase}
            confirmPassphrase={confirmPassphrase}
            onConfirmPassphraseChange={setConfirmPassphrase}
          />
        )}

        {currentStep === 4 && (
          <IntervalSelector
            checkInInterval={checkInInterval}
            onIntervalChange={setCheckInInterval}
            selectedPlatforms={selectedPlatforms}
            beneficiaries={beneficiaries}
          />
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <Card className="mt-4 border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{submitError}</p>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        {currentStep < TOTAL_STEPS - 1 ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={!canProceed()}
          >
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? "Encrypting & Saving..." : "Create Plan"}
          </Button>
        )}
      </div>
    </div>
  );
}
