"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BRAND_VOICES } from "@/lib/types";
import type { BarProfile } from "@/lib/types";
import { Loader2, Save, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<BarProfile>>({
    bar_name: "",
    brand_voice: "casual",
    default_hashtags: [],
    social_handles: {},
    location_city: "",
    location_state: "",
  });
  const [hashtagInput, setHashtagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/bar-profile");
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setHashtagInput(
          (data.profile.default_hashtags || [])
            .map((h: string) => (h.startsWith("#") ? h : `#${h}`))
            .join(" ")
        );
      }
    } catch {
      console.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const hashtags = hashtagInput
      .split(/[\s,]+/)
      .map((h) => h.trim().replace(/^#/, ""))
      .filter(Boolean);

    try {
      const res = await fetch("/api/bar-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bar_name: profile.bar_name,
          brand_voice: profile.brand_voice,
          default_hashtags: hashtags,
          social_handles: profile.social_handles,
          location_city: profile.location_city,
          location_state: profile.location_state,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      console.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal");
      const data = await res.json();
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    } catch {
      console.error("Failed to open portal");
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your bar profile and manage your subscription.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bar Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Bar Profile</CardTitle>
            <CardDescription>
              This info helps AI generate better, more personalized content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bar_name">Bar Name</Label>
                <Input
                  id="bar_name"
                  placeholder="The Rusty Nail"
                  value={profile.bar_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, bar_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand_voice">Brand Voice</Label>
                <div className="flex flex-wrap gap-2">
                  {BRAND_VOICES.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() =>
                        setProfile({ ...profile, brand_voice: v.value })
                      }
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        profile.brand_voice === v.value
                          ? "bg-amber-500 text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location_city">City</Label>
                <Input
                  id="location_city"
                  placeholder="Austin"
                  value={profile.location_city || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, location_city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_state">State</Label>
                <Input
                  id="location_state"
                  placeholder="TX"
                  value={profile.location_state || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, location_state: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashtags">Default Hashtags</Label>
              <Input
                id="hashtags"
                placeholder="#happyhour #downtown #cocktails"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate with spaces or commas. These will be included in every generation.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Social Handles</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ig_handle" className="text-xs text-muted-foreground">
                    Instagram
                  </Label>
                  <Input
                    id="ig_handle"
                    placeholder="@yourbar"
                    value={(profile.social_handles as Record<string, string>)?.instagram || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        social_handles: {
                          ...(profile.social_handles as Record<string, string>),
                          instagram: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb_handle" className="text-xs text-muted-foreground">
                    Facebook
                  </Label>
                  <Input
                    id="fb_handle"
                    placeholder="yourbar"
                    value={(profile.social_handles as Record<string, string>)?.facebook || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        social_handles: {
                          ...(profile.social_handles as Record<string, string>),
                          facebook: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Saved!" : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your On Special Pro subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="gap-2"
          >
            {portalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
