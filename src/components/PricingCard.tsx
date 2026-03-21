"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Sparkles, Crown } from "lucide-react";
import Link from "next/link";

export function PricingCard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
      {/* Free Plan */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-party-pink" />
            Free Plan
          </CardTitle>
          <p className="text-3xl font-bold">$0</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              "1 AI-generated party plan",
              "10 themed templates",
              "Printable plan",
              "Basic shopping list",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/plan/new">
            <Button className="mt-6 w-full bg-party-pink hover:bg-pink-600">
              Get Started Free
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Premium Plan */}
      <Card className="relative border-party-pink border-2">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-party-pink px-3 py-1 text-xs font-bold text-white">
            MOST POPULAR
          </span>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-party-purple" />
            Party Pass
          </CardTitle>
          <p className="text-3xl font-bold">
            $4.99
            <span className="text-sm font-normal text-gray-500"> / party</span>
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              "Unlimited AI plan regenerations",
              "RSVP tracking & guest management",
              "Shareable RSVP link",
              "Dietary needs summary",
              "Premium shopping list",
              "All 10 themed templates",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-party-purple" />
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/plan/new">
            <Button className="mt-6 w-full bg-gradient-to-r from-party-pink to-party-purple hover:opacity-90">
              Plan a Party
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
