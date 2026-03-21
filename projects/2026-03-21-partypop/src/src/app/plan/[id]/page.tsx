"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Party } from "@/types";
import { getThemeBySlug } from "@/lib/themes";
import { PlanView } from "@/components/PlanView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  Share2,
  Users,
  Crown,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function PlanPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [enablingRsvp, setEnablingRsvp] = useState(false);

  const upgraded = searchParams.get("upgraded") === "true";
  const partyId = params.id as string;

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("parties")
        .select("*")
        .eq("id", partyId)
        .single();

      if (!data) {
        router.push("/dashboard");
        return;
      }

      setParty(data);
      setLoading(false);
    }
    load();
  }, [router, partyId]);

  const enableRsvp = async () => {
    if (!party) return;
    setEnablingRsvp(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party_id: party.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setParty((p) => p ? { ...p, rsvp_enabled: true, rsvp_slug: data.rsvp_slug } : p);
      }
    } finally {
      setEnablingRsvp(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party_id: partyId }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      }
    } catch {
      // handle error silently
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-party-pink" />
      </div>
    );
  }

  if (!party) return null;

  const theme = getThemeBySlug(party.theme);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Upgraded banner */}
      {upgraded && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-party-pink to-party-purple p-4 text-center text-white">
          <Crown className="mx-auto mb-1 h-6 w-6" />
          <p className="font-semibold">Party Pass Activated!</p>
          <p className="text-sm opacity-90">You now have access to all premium features for this party.</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{theme?.emoji || "🎉"}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{party.title}</h1>
            <p className="text-gray-600">
              {party.child_name}, turning {party.child_age} | {party.headcount} guests
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {party.is_premium && <Badge className="bg-party-purple">Premium</Badge>}
          <Badge variant="secondary">{party.status}</Badge>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-6 flex flex-wrap gap-2 no-print">
        <Link href={`/plan/${partyId}/print`}>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </Link>

        {party.rsvp_enabled && party.rsvp_slug ? (
          <>
            <Link href={`/plan/${partyId}/rsvp`}>
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                RSVP Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(`${siteUrl}/rsvp/${party.rsvp_slug}`)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Copy RSVP Link
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={enableRsvp}
            disabled={enablingRsvp}
          >
            {enablingRsvp ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            Enable RSVP
          </Button>
        )}

        {!party.is_premium && (
          <Button
            size="sm"
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-party-pink to-party-purple hover:opacity-90"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade — $4.99
          </Button>
        )}
      </div>

      {/* Plan content */}
      {party.plan_data ? (
        <PlanView plan={party.plan_data} />
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <span className="text-5xl">✨</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Plan not generated yet
            </h3>
            <p className="mt-2 text-gray-600">
              Your party plan hasn&apos;t been generated yet.
            </p>
            <Link href="/plan/new">
              <Button className="mt-4 bg-party-pink hover:bg-pink-600">
                Generate Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
