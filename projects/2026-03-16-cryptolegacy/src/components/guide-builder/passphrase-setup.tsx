"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { passphraseSchema } from "@/lib/validations";

interface PassphraseSetupProps {
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
  confirmPassphrase: string;
  onConfirmPassphraseChange: (confirmPassphrase: string) => void;
}

type StrengthLevel = "weak" | "fair" | "good" | "strong";

function evaluateStrength(value: string): {
  score: number;
  level: StrengthLevel;
  label: string;
} {
  if (value.length === 0) return { score: 0, level: "weak", label: "" };

  let score = 0;

  // Length contribution (up to 30 points)
  score += Math.min(value.length * 2, 30);

  // Character diversity
  if (/[a-z]/.test(value)) score += 10;
  if (/[A-Z]/.test(value)) score += 10;
  if (/[0-9]/.test(value)) score += 10;
  if (/[^a-zA-Z0-9]/.test(value)) score += 15;

  // Unique characters ratio
  const unique = new Set(value).size;
  score += Math.min((unique / value.length) * 25, 25);

  // Clamp to 100
  score = Math.min(Math.round(score), 100);

  if (score < 30) return { score, level: "weak", label: "Weak" };
  if (score < 55) return { score, level: "fair", label: "Fair" };
  if (score < 80) return { score, level: "good", label: "Good" };
  return { score, level: "strong", label: "Strong" };
}

const strengthColors: Record<StrengthLevel, string> = {
  weak: "bg-destructive",
  fair: "bg-orange-500",
  good: "bg-yellow-500",
  strong: "bg-green-500",
};

export function PassphraseSetup({
  passphrase,
  onPassphraseChange,
  confirmPassphrase,
  onConfirmPassphraseChange,
}: PassphraseSetupProps) {
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = useMemo(() => evaluateStrength(passphrase), [passphrase]);

  const passphraseValidation = useMemo(() => {
    if (passphrase.length === 0) return null;
    const result = passphraseSchema.safeParse(passphrase);
    if (result.success) return null;
    return result.error.issues[0]?.message ?? "Invalid passphrase";
  }, [passphrase]);

  const mismatch =
    confirmPassphrase.length > 0 && passphrase !== confirmPassphrase;

  const isValid =
    passphrase.length >= 12 &&
    passphrase === confirmPassphrase &&
    passphraseValidation === null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Set Your Passphrase</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This passphrase encrypts your recovery plan. It must be at least 12
          characters and use a mix of character types.
        </p>
      </div>

      {/* Warning banner */}
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <span className="mt-0.5 text-xl text-destructive" aria-hidden="true">
              !!!
            </span>
            <div className="space-y-2">
              <p className="text-sm font-bold text-destructive">
                THERE IS NO PASSWORD RESET
              </p>
              <p className="text-sm text-destructive/90">
                If you lose this passphrase, your encrypted data is
                unrecoverable. Share this passphrase with your beneficiaries
                in person, by phone, or in a sealed envelope. Never send it
                via email or text message.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passphrase input */}
      <div className="space-y-2">
        <Label htmlFor="passphrase">Passphrase</Label>
        <div className="relative">
          <Input
            id="passphrase"
            type={showPassphrase ? "text" : "password"}
            placeholder="Enter a strong passphrase (min 12 characters)"
            value={passphrase}
            onChange={(e) => onPassphraseChange(e.target.value)}
            className="pr-20"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 text-xs"
            onClick={() => setShowPassphrase(!showPassphrase)}
          >
            {showPassphrase ? "Hide" : "Show"}
          </Button>
        </div>
        {passphraseValidation && passphrase.length > 0 && (
          <p className="text-xs text-destructive">{passphraseValidation}</p>
        )}
      </div>

      {/* Strength indicator */}
      {passphrase.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Passphrase strength
            </Label>
            <span
              className={`text-xs font-medium ${
                strength.level === "strong"
                  ? "text-green-600"
                  : strength.level === "good"
                  ? "text-yellow-600"
                  : strength.level === "fair"
                  ? "text-orange-600"
                  : "text-destructive"
              }`}
            >
              {strength.label}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all duration-300 ${
                strengthColors[strength.level]
              }`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
        </div>
      )}

      {/* Confirm passphrase input */}
      <div className="space-y-2">
        <Label htmlFor="confirm-passphrase">Confirm Passphrase</Label>
        <div className="relative">
          <Input
            id="confirm-passphrase"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter your passphrase"
            value={confirmPassphrase}
            onChange={(e) => onConfirmPassphraseChange(e.target.value)}
            className="pr-20"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 text-xs"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "Hide" : "Show"}
          </Button>
        </div>
        {mismatch && (
          <p className="text-xs text-destructive">
            Passphrases do not match.
          </p>
        )}
        {isValid && (
          <p className="text-xs text-green-600">
            Passphrases match. You are ready to proceed.
          </p>
        )}
      </div>
    </div>
  );
}
