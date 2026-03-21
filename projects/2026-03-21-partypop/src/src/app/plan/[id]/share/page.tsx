"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Party } from "@/types";
import { PlanView } from "@/components/PlanView";
import { getThemeBySlug } from "@/lib/themes";
import { Loader2 } from "lucide-react";

export default function SharePage() {
  const params = useParams();
  const partyId = params.id as string;
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("parties")
        .select("*")
        .eq("id", partyId)
        .single();

      if (!data || data.status === "archived") {
        setNotFound(true);
      } else {
        setParty(data);
      }
      setLoading(false);
    }
    load();
  }, [partyId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-party-pink" />
      </div>
    );
  }

  if (notFound || !party) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center">
        <div>
          <span className="text-5xl">😢</span>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Party Not Available
          </h2>
          <p className="mt-2 text-gray-600">
            This party plan is no longer available.
          </p>
        </div>
      </div>
    );
  }

  const theme = getThemeBySlug(party.theme);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 text-center">
        <span className="text-5xl">{theme?.emoji || "🎉"}</span>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{party.title}</h1>
        <p className="text-gray-600">
          {party.child_name} is turning {party.child_age}!
        </p>
      </div>
      {party.plan_data && <PlanView plan={party.plan_data} />}
    </div>
  );
}
