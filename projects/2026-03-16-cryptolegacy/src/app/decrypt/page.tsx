"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, Loader2, AlertTriangle, ShieldOff } from "lucide-react";
import Link from "next/link";
import { decrypt } from "@/lib/crypto";
import { PassphraseInput } from "@/components/decrypt/passphrase-input";
import { RecoveryGuide } from "@/components/decrypt/recovery-guide";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MAX_ATTEMPTS = 5;

interface PlanData {
  title: string;
  ciphertext: string;
  iv: string;
  salt: string;
}

type PageState =
  | { status: "loading" }
  | { status: "error"; code: number; message: string }
  | { status: "ready"; plan: PlanData }
  | { status: "decrypted"; plan: PlanData; decryptedData: Record<string, Record<string, string>> };

export default function DecryptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <DecryptContent />
    </Suspense>
  );
}

function DecryptContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [pageState, setPageState] = useState<PageState>({ status: "loading" });
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);

  useEffect(() => {
    if (!token) {
      setPageState({
        status: "error",
        code: 400,
        message: "No access token provided. Please use the link from your email.",
      });
      return;
    }

    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/decrypt?token=${encodeURIComponent(token)}`);

        if (res.status === 404) {
          setPageState({
            status: "error",
            code: 404,
            message:
              "This recovery link is invalid or has expired. Please contact the plan owner for a new link.",
          });
          return;
        }

        if (res.status === 403) {
          setPageState({
            status: "error",
            code: 403,
            message:
              "This recovery plan has not been triggered yet. The plan owner's dead man's switch must be activated before you can access this plan.",
          });
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setPageState({
            status: "error",
            code: res.status,
            message:
              body.error ||
              "Something went wrong while loading the recovery plan. Please try again later.",
          });
          return;
        }

        const data = await res.json();
        setPageState({
          status: "ready",
          plan: {
            title: data.title,
            ciphertext: data.ciphertext,
            iv: data.iv,
            salt: data.salt,
          },
        });
      } catch {
        setPageState({
          status: "error",
          code: 0,
          message:
            "Unable to connect to the server. Please check your internet connection and try again.",
        });
      }
    };

    fetchPlan();
  }, [token]);

  const handleDecrypt = async (passphrase: string) => {
    if (pageState.status !== "ready") return;

    setDecrypting(true);
    setDecryptError(null);

    try {
      const plaintext = await decrypt(
        pageState.plan.ciphertext,
        pageState.plan.iv,
        pageState.plan.salt,
        passphrase
      );

      const parsed = JSON.parse(plaintext);
      setPageState({
        status: "decrypted",
        plan: pageState.plan,
        decryptedData: parsed,
      });
    } catch {
      const remaining = attemptsRemaining - 1;
      setAttemptsRemaining(remaining);
      if (remaining > 0) {
        setDecryptError(
          "Incorrect passphrase. Please double-check the passphrase that was shared with you and try again."
        );
      } else {
        setDecryptError(
          "Maximum attempts exceeded. Access to this recovery plan has been locked."
        );
      }
    } finally {
      setDecrypting(false);
    }
  };

  // --- Loading state ---
  if (pageState.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Loading recovery plan...
          </p>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (pageState.status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            {pageState.code === 403 ? (
              <ShieldOff className="h-12 w-12 text-amber-500 mx-auto" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {pageState.code === 404
              ? "Link Not Found"
              : pageState.code === 403
              ? "Plan Not Triggered"
              : "Something Went Wrong"}
          </h1>
          <p className="text-muted-foreground mb-6">{pageState.message}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // --- Decrypted state ---
  if (pageState.status === "decrypted") {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 print:hidden">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Shield className="h-6 w-6 text-primary" />
              CryptoLegacy
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <RecoveryGuide
            data={pageState.decryptedData}
            planTitle={pageState.plan.title}
          />
        </div>
      </div>
    );
  }

  // --- Ready state (passphrase entry) ---
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-xl mb-2"
          >
            <Shield className="h-6 w-6 text-primary" />
            CryptoLegacy
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{pageState.plan.title}</CardTitle>
            <CardDescription>
              A recovery plan has been shared with you. Enter the passphrase
              that was provided to you to decrypt and view the recovery
              instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PassphraseInput
              onSubmit={handleDecrypt}
              attemptsRemaining={attemptsRemaining}
              maxAttempts={MAX_ATTEMPTS}
              error={decryptError}
              loading={decrypting}
            />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          All decryption happens in your browser. Your passphrase is never sent
          to our servers.
        </p>
      </div>
    </div>
  );
}
