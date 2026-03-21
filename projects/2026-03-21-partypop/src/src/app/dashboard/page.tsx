"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Party } from "@/types";
import { getThemeBySlug } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
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
        .order("created_at", { ascending: false });

      setParties(data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-party-pink" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Parties</h1>
          <p className="text-gray-600">Manage your birthday party plans</p>
        </div>
        <Link href="/plan/new">
          <Button className="bg-party-pink hover:bg-pink-600">
            <Plus className="mr-2 h-4 w-4" />
            New Party
          </Button>
        </Link>
      </div>

      {parties.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <span className="text-5xl">🎈</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No parties yet!</h3>
            <p className="mt-2 text-gray-600">
              Create your first party plan and let AI do the planning for you.
            </p>
            <Link href="/plan/new">
              <Button className="mt-4 bg-party-pink hover:bg-pink-600">
                Plan Your First Party
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {parties.map((party) => {
            const theme = getThemeBySlug(party.theme);
            return (
              <Link key={party.id} href={`/plan/${party.id}`}>
                <Card className="transition-shadow hover:shadow-md cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="text-3xl">{theme?.emoji || "🎉"}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{party.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{party.child_name}, turning {party.child_age}</span>
                        {party.party_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(party.party_date + "T00:00:00").toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {party.headcount} guests
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {party.is_premium && (
                        <Badge className="bg-party-purple">Premium</Badge>
                      )}
                      <Badge
                        variant={
                          party.status === "generated" ? "default" :
                          party.status === "active" ? "default" :
                          "secondary"
                        }
                      >
                        {party.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
