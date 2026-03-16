"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PassphraseInputProps {
  onSubmit: (passphrase: string) => void;
  attemptsRemaining: number;
  maxAttempts: number;
  error: string | null;
  loading: boolean;
}

export function PassphraseInput({
  onSubmit,
  attemptsRemaining,
  maxAttempts,
  error,
  loading,
}: PassphraseInputProps) {
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim() || loading || attemptsRemaining <= 0) return;
    onSubmit(passphrase);
  };

  const isLockedOut = attemptsRemaining <= 0;

  if (isLockedOut) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
        <Lock className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Access Locked
        </h3>
        <p className="text-sm text-muted-foreground">
          You have exceeded the maximum number of decryption attempts. For
          security, this recovery plan has been locked. Please contact the plan
          owner for assistance.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="passphrase">Recovery Passphrase</Label>
        <p className="text-xs text-muted-foreground">
          Enter the passphrase that was shared with you by the plan owner.
        </p>
        <div className="relative">
          <Input
            id="passphrase"
            type={showPassphrase ? "text" : "password"}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter your passphrase"
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassphrase(!showPassphrase)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassphrase ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {attemptsRemaining} of {maxAttempts} attempts remaining
        </span>
        {attemptsRemaining <= 2 && attemptsRemaining > 0 && (
          <span className="text-xs text-amber-600 font-medium">
            Running low on attempts
          </span>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading || !passphrase.trim()}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Decrypting...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Decrypt Recovery Plan
          </>
        )}
      </Button>
    </form>
  );
}
