"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { TEMPLATE_TYPES } from "@/lib/types";
import type { GenerateResponse } from "@/lib/types";
import { Loader2, Instagram, Facebook, Globe, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [specialsText, setSpecialsText] = useState("");
  const [templateType, setTemplateType] = useState("daily_special");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState("");
  const [needsSubscription, setNeedsSubscription] = useState(false);

  async function handleGenerate() {
    if (!specialsText.trim()) return;

    setLoading(true);
    setError("");
    setNeedsSubscription(false);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specials_text: specialsText,
          template_type: templateType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.error === "subscription_required") {
          setNeedsSubscription(true);
          return;
        }
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Content</h1>
        <p className="text-muted-foreground mt-1">
          Type tonight&apos;s specials and get instant social media posts.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specials">Tonight&apos;s Specials</Label>
            <Textarea
              id="specials"
              placeholder="$5 margaritas, half-price wings, live jazz by Marcus Brown starting at 8pm..."
              value={specialsText}
              onChange={(e) => setSpecialsText(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {specialsText.length}/2000
            </p>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTemplateType(t.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    templateType === t.value
                      ? "bg-amber-500 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !specialsText.trim()}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error States */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {needsSubscription && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-lg font-semibold">Free tier limit reached</p>
            <p className="text-muted-foreground">
              Upgrade to On Special Pro for 50 generations per day.
            </p>
            <Link href="/pricing">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                Upgrade — $49/mo
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Content</h2>

          {result.warnings.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-sm text-amber-600 dark:text-amber-400">
                  {w}
                </p>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {/* Instagram */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  Instagram
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {result.instagram.caption}
                </p>
                {result.instagram.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.instagram.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </Badge>
                    ))}
                  </div>
                )}
                <CopyButton
                  text={`${result.instagram.caption}\n\n${result.instagram.hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}`}
                />
              </CardContent>
            </Card>

            {/* Facebook */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Facebook className="h-5 w-5 text-blue-500" />
                  Facebook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {result.facebook.post}
                </p>
                <CopyButton text={result.facebook.post} />
              </CardContent>
            </Card>

            {/* Google */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-5 w-5 text-green-500" />
                  Google Business
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {result.google.update}
                </p>
                <CopyButton text={result.google.update} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
