"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckInButtonProps {
  planId: string;
  status: "active" | "paused" | "triggered" | "disabled";
  onCheckInComplete?: (nextCheckIn: string) => void;
  onError?: (error: string) => void;
}

export function CheckInButton({
  planId,
  status,
  onCheckInComplete,
  onError,
}: CheckInButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const isDisabled = status !== "active" || state === "loading" || state === "success";

  const handleCheckIn = async () => {
    if (isDisabled) return;

    setState("loading");

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to check in");
      }

      const data = await res.json();
      setState("success");
      onCheckInComplete?.(data.next_check_in);

      // Reset back to idle after 3 seconds
      setTimeout(() => {
        setState("idle");
      }, 3000);
    } catch (err) {
      setState("idle");
      onError?.(err instanceof Error ? err.message : "Failed to check in");
    }
  };

  return (
    <Button
      onClick={handleCheckIn}
      disabled={isDisabled}
      size="lg"
      className={cn(
        "w-full gap-2 font-semibold text-base transition-all duration-300",
        state === "success" &&
          "bg-emerald-600 hover:bg-emerald-600 text-white",
        status !== "active" && "opacity-50 cursor-not-allowed"
      )}
    >
      {state === "loading" && (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Checking in...
        </>
      )}
      {state === "success" && (
        <>
          <Check className="h-5 w-5 animate-in zoom-in-50 duration-300" />
          Check-in Recorded
        </>
      )}
      {state === "idle" && (
        <>
          <HeartPulse className="h-5 w-5" />
          I&apos;m Still Here
        </>
      )}
    </Button>
  );
}
