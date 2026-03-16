"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type CheckInState = "loading" | "success" | "error";

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <CheckInContent />
    </Suspense>
  );
}

function CheckInContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const [state, setState] = useState<CheckInState>("loading");
  const [nextCheckIn, setNextCheckIn] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    if (!planId) {
      setState("error");
      setErrorMessage("No plan specified. Please use the link from your email.");
      return;
    }

    const performCheckIn = async () => {
      try {
        const res = await fetch("/api/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_id: planId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          if (res.status === 401) {
            throw new Error(
              "You need to be logged in to check in. Please log in and try again."
            );
          }

          throw new Error(
            data.error || "Failed to record check-in. Please try again."
          );
        }

        const data = await res.json();
        setNextCheckIn(data.next_check_in);
        setState("success");
      } catch (err) {
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      }
    };

    performCheckIn();
  }, [planId]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-xl"
          >
            <Shield className="h-6 w-6 text-primary" />
            CryptoLegacy
          </Link>
        </div>

        {/* Loading state */}
        {state === "loading" && (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-1">
                Recording your check-in...
              </h2>
              <p className="text-sm text-muted-foreground">
                Please wait while we confirm your check-in.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Success state */}
        {state === "success" && (
          <Card className="border-emerald-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Check-in Recorded</CardTitle>
              <CardDescription>
                Your dead man&apos;s switch has been reset successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextCheckIn && (
                <div className="rounded-lg bg-emerald-50 p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Next check-in due by
                  </p>
                  <p className="text-lg font-semibold text-emerald-700">
                    {new Date(nextCheckIn).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              <p className="text-sm text-center text-muted-foreground">
                We&apos;ll send you a reminder email before your next check-in
                is due.
              </p>
              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {state === "error" && (
          <Card className="border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Check-in Failed</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {errorMessage.includes("logged in") ? (
                <Button asChild className="w-full" size="lg">
                  <Link
                    href={`/auth/login?redirectTo=${encodeURIComponent(`/check-in?plan=${planId}`)}`}
                  >
                    Log In to Check In
                  </Link>
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setState("loading");
                    hasAttempted.current = false;
                    // Re-trigger the effect by forcing a state cycle
                    setTimeout(() => {
                      hasAttempted.current = true;
                      fetch("/api/check-in", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ plan_id: planId }),
                      })
                        .then(async (res) => {
                          if (!res.ok) {
                            const data = await res.json().catch(() => ({}));
                            throw new Error(
                              data.error || "Failed to record check-in."
                            );
                          }
                          return res.json();
                        })
                        .then((data) => {
                          setNextCheckIn(data.next_check_in);
                          setState("success");
                        })
                        .catch((err) => {
                          setState("error");
                          setErrorMessage(
                            err instanceof Error
                              ? err.message
                              : "An unexpected error occurred."
                          );
                        });
                    }, 0);
                  }}
                >
                  Try Again
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
