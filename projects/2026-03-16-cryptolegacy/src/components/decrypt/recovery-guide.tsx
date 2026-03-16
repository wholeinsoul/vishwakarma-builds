"use client";

import { Printer, Shield, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { platformTemplates, getTemplateById } from "@/lib/templates";

/**
 * The decrypted JSON structure:
 * Record<string, Record<string, string>>
 * where keys are platform IDs (e.g. "coinbase", "ledger")
 * and values are field data (e.g. { email: "foo@bar.com", password: "..." })
 */
interface RecoveryGuideProps {
  data: Record<string, Record<string, string>>;
  planTitle: string;
}

/** Map of platform ID to emoji icon (from templates). */
function getPlatformIcon(platformId: string): string {
  const template = getTemplateById(platformId);
  return template?.icon ?? "🔑";
}

/** Get display name for a platform. */
function getPlatformName(platformId: string): string {
  const template = getTemplateById(platformId);
  return template?.name ?? platformId.charAt(0).toUpperCase() + platformId.slice(1);
}

/** Get the human-readable label for a field. */
function getFieldLabel(platformId: string, fieldId: string): string {
  const template = getTemplateById(platformId);
  if (template) {
    const field = template.fields.find((f) => f.id === fieldId);
    if (field) return field.label;
  }
  return fieldId.charAt(0).toUpperCase() + fieldId.slice(1).replace(/_/g, " ");
}

/** Get recovery steps for a platform. */
function getRecoverySteps(platformId: string): string[] {
  const template = getTemplateById(platformId);
  return template?.recoverySteps ?? [];
}

function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing if clipboard is unavailable
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
        {value}
      </span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground print:hidden"
        title="Copy to clipboard"
      >
        {copied ? (
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

export function RecoveryGuide({ data, planTitle }: RecoveryGuideProps) {
  const platformIds = Object.keys(data);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:justify-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-primary print:hidden" />
            <h2 className="text-xl font-bold">Recovery Guide</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Plan: {planTitle} &mdash; Decrypted on{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="print:hidden"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print this page
        </Button>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 print:bg-amber-50">
        <strong>Important:</strong> This page contains highly sensitive
        information including passwords and recovery keys. Do not share this
        page or leave it open unattended. Print a copy for safekeeping if
        needed, then close this browser tab.
      </div>

      <Separator />

      {/* Platform sections */}
      {platformIds.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No recovery data found in this plan.</p>
        </div>
      ) : (
        platformIds.map((platformId) => {
          const fields = data[platformId];
          const recoverySteps = getRecoverySteps(platformId);
          const fieldEntries = Object.entries(fields).filter(
            ([, value]) => value && value.trim() !== ""
          );

          return (
            <Card key={platformId} className="print:break-inside-avoid print:shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{getPlatformIcon(platformId)}</span>
                  {getPlatformName(platformId)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Field values */}
                {fieldEntries.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Account Details
                    </h4>
                    <div className="grid gap-3">
                      {fieldEntries.map(([fieldId, value]) => (
                        <div key={fieldId} className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            {getFieldLabel(platformId, fieldId)}
                          </label>
                          <CopyableValue value={value} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recovery steps */}
                {recoverySteps.length > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Recovery Steps
                    </h4>
                    <ol className="space-y-2 list-none">
                      {recoverySteps.map((step, index) => (
                        <li key={index} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4 print:py-8">
        <p>
          Generated by CryptoLegacy &mdash; This document is confidential.
          Handle with care.
        </p>
      </div>
    </div>
  );
}
