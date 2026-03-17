"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_VOICES } from "@/lib/types";
import { Loader2, Zap, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const [barName, setBarName] = useState("");
  const [brandVoice, setBrandVoice] = useState("casual");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const hashtagList = hashtags
      .split(/[\s,]+/)
      .map((h) => h.trim().replace(/^#/, ""))
      .filter(Boolean);

    try {
      await fetch("/api/bar-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bar_name: barName,
          brand_voice: brandVoice,
          default_hashtags: hashtagList,
          social_handles: {},
        }),
      });
    } catch {
      // Non-blocking — redirect regardless
    }

    router.push("/dashboard");
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-amber-500" />
            <span className="text-2xl font-bold">On Special</span>
          </div>
          <CardTitle className="text-2xl">Set up your bar</CardTitle>
          <CardDescription>
            This helps us generate better content for you. You can update these
            later in Settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bar_name">Bar Name</Label>
              <Input
                id="bar_name"
                placeholder="The Rusty Nail"
                value={barName}
                onChange={(e) => setBarName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Brand Voice</Label>
              <p className="text-xs text-muted-foreground mb-2">
                How should your posts sound?
              </p>
              <div className="flex flex-wrap gap-2">
                {BRAND_VOICES.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setBrandVoice(v.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      brandVoice === v.value
                        ? "bg-amber-500 text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashtags">Default Hashtags</Label>
              <Input
                id="hashtags"
                placeholder="#happyhour #downtown #cocktails"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate with spaces. We&apos;ll include these in every post.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
