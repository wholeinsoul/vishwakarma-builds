"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PartyPopper } from "lucide-react";

export default function RsvpConfirmedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          {/* Confetti decorations */}
          <div className="relative mb-4">
            <span className="absolute -left-4 top-0 text-3xl animate-confetti" style={{ animationDelay: "0s" }}>🎊</span>
            <span className="absolute -right-4 top-0 text-3xl animate-confetti" style={{ animationDelay: "0.3s" }}>🎉</span>
            <span className="absolute left-8 -top-4 text-2xl animate-confetti" style={{ animationDelay: "0.5s" }}>✨</span>
            <span className="absolute right-8 -top-4 text-2xl animate-confetti" style={{ animationDelay: "0.7s" }}>🎈</span>
            <PartyPopper className="mx-auto h-16 w-16 text-party-pink" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            You&apos;re All Set!
          </h1>
          <p className="mt-2 text-gray-600">
            Your RSVP has been submitted successfully. The party host has been notified!
          </p>
          <div className="mt-6 rounded-lg bg-pink-50 p-4">
            <p className="text-sm text-gray-700">
              Need to change your response? Just visit this link again and submit a new RSVP with the same email.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="mt-6">
              Back to Partypop
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
