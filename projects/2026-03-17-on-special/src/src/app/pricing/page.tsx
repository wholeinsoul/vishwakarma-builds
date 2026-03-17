"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Loader2 } from "lucide-react";

const features = [
  "50 content generations per day",
  "Instagram, Facebook & Google posts",
  "Custom brand voice & hashtags",
  "AI-powered by GPT-4o-mini",
  "Content history & re-use",
  "Bar profile customization",
  "Priority support",
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-amber-500" />
            <span className="text-xl font-bold">On Special</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            One plan. Everything you need to turn tonight&apos;s specials into
            scroll-stopping social content.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-amber-500/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">On Special Pro</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold">$49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Less than the cost of one social media post from a freelancer.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Start Now
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime. No contracts.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Free tier note */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Not ready to commit?{" "}
            <Link
              href="/signup"
              className="text-amber-500 underline underline-offset-4"
            >
              Try 3 free generations
            </Link>{" "}
            — no credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
