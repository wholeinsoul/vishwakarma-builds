"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Party } from "@/types";
import { getThemeBySlug } from "@/lib/themes";
import { RsvpForm } from "@/components/RsvpForm";
import { Loader2 } from "lucide-react";

export default function RsvpPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("parties")
        .select("*")
        .eq("rsvp_slug", slug)
        .eq("rsvp_enabled", true)
        .single();

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check deadline
      if (data.rsvp_deadline) {
        const deadline = new Date(data.rsvp_deadline + "T23:59:59");
        if (new Date() > deadline) {
          setClosed(true);
          setParty(data);
          setLoading(false);
          return;
        }
      }

      setParty(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-party-pink" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center">
        <div>
          <span className="text-5xl">🔍</span>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Party Not Found
          </h2>
          <p className="mt-2 text-gray-600">
            This RSVP link is not valid or has been disabled.
          </p>
        </div>
      </div>
    );
  }

  if (closed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center">
        <div>
          <span className="text-5xl">⏰</span>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            RSVPs Are Closed
          </h2>
          <p className="mt-2 text-gray-600">
            The RSVP deadline for this party has passed.
          </p>
        </div>
      </div>
    );
  }

  if (!party) return null;

  const theme = getThemeBySlug(party.theme);

  return (
    <div className="px-4 py-8">
      <RsvpForm
        partyId={party.id}
        partyTitle={party.title}
        childName={party.child_name}
        theme={party.theme}
        themeEmoji={theme?.emoji || "🎉"}
        slug={slug}
      />
    </div>
  );
}
