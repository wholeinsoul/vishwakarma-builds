"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Party, Rsvp } from "@/types";
import { RsvpDashboard } from "@/components/RsvpDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function RsvpManagementPage() {
  const router = useRouter();
  const params = useParams();
  const partyId = params.id as string;
  const [party, setParty] = useState<Party | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: partyData } = await supabase
        .from("parties")
        .select("*")
        .eq("id", partyId)
        .single();

      if (!partyData) {
        router.push("/dashboard");
        return;
      }

      const { data: rsvpData } = await supabase
        .from("rsvps")
        .select("*")
        .eq("party_id", partyId)
        .order("created_at", { ascending: false });

      setParty(partyData);
      setRsvps(rsvpData || []);
      setLoading(false);
    }
    load();
  }, [router, partyId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-party-pink" />
      </div>
    );
  }

  if (!party) return null;

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/plan/${partyId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plan
          </Button>
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          RSVP Dashboard — {party.title}
        </h1>
      </div>

      <RsvpDashboard
        rsvps={rsvps}
        rsvpSlug={party.rsvp_slug}
        siteUrl={siteUrl}
      />
    </div>
  );
}
