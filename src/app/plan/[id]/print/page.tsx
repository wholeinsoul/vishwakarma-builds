"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Party } from "@/types";
import { PrintView } from "@/components/PrintView";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PrintPage() {
  const router = useRouter();
  const params = useParams();
  const partyId = params.id as string;
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-party-pink" />
      </div>
    );
  }

  if (!party || !party.plan_data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">No plan to print</h2>
        <p className="mt-2 text-gray-600">Generate a plan first before printing.</p>
        <Link href={`/plan/${partyId}`}>
          <Button className="mt-4 bg-party-pink hover:bg-pink-600">
            Back to Plan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 py-4 no-print">
        <div className="flex items-center justify-between">
          <Link href={`/plan/${partyId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plan
            </Button>
          </Link>
          <Button
            onClick={() => window.print()}
            className="bg-party-pink hover:bg-pink-600"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      <PrintView party={party} plan={party.plan_data} />
    </div>
  );
}
