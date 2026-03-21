"use client";

import type { Rsvp } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, Check, X, HelpCircle, AlertTriangle } from "lucide-react";

interface RsvpDashboardProps {
  rsvps: Rsvp[];
  rsvpSlug: string | null;
  siteUrl: string;
}

export function RsvpDashboard({ rsvps, rsvpSlug, siteUrl }: RsvpDashboardProps) {
  const attending = rsvps.filter((r) => r.attending === "yes");
  const declined = rsvps.filter((r) => r.attending === "no");
  const maybe = rsvps.filter((r) => r.attending === "maybe");

  const totalChildren = attending.reduce((sum, r) => sum + r.num_children, 0);
  const dietaryNeeds = rsvps
    .filter((r) => r.dietary_needs && r.attending !== "no")
    .map((r) => ({ name: r.guest_name, needs: r.dietary_needs! }));

  const rsvpUrl = rsvpSlug ? `${siteUrl}/rsvp/${rsvpSlug}` : null;

  return (
    <div className="space-y-6">
      {/* Share Link */}
      {rsvpUrl && (
        <Card className="border-party-pink bg-pink-50">
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-medium text-gray-700">Share this RSVP link with guests:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-white px-3 py-2 text-sm">{rsvpUrl}</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(rsvpUrl)}
                className="rounded-lg bg-party-pink px-3 py-2 text-sm font-medium text-white hover:bg-pink-600"
              >
                Copy
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-1 h-6 w-6 text-blue-500" />
            <p className="text-2xl font-bold">{rsvps.length}</p>
            <p className="text-xs text-gray-500">Total RSVPs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Check className="mx-auto mb-1 h-6 w-6 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{attending.length}</p>
            <p className="text-xs text-gray-500">Attending ({totalChildren} kids)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <HelpCircle className="mx-auto mb-1 h-6 w-6 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-600">{maybe.length}</p>
            <p className="text-xs text-gray-500">Maybe</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <X className="mx-auto mb-1 h-6 w-6 text-red-500" />
            <p className="text-2xl font-bold text-red-600">{declined.length}</p>
            <p className="text-xs text-gray-500">Declined</p>
          </CardContent>
        </Card>
      </div>

      {/* Guest List */}
      <Card>
        <CardHeader>
          <CardTitle>Guest List</CardTitle>
        </CardHeader>
        <CardContent>
          {rsvps.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No RSVPs yet. Share the link above to start collecting responses!
            </p>
          ) : (
            <div className="divide-y">
              {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{rsvp.guest_name}</p>
                    {rsvp.guest_email && (
                      <p className="text-xs text-gray-500">{rsvp.guest_email}</p>
                    )}
                    {rsvp.notes && (
                      <p className="text-xs text-gray-400 italic mt-0.5">{rsvp.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {rsvp.attending === "yes" && rsvp.num_children > 0 && (
                      <span className="text-xs text-gray-500">{rsvp.num_children} kid{rsvp.num_children > 1 ? "s" : ""}</span>
                    )}
                    <Badge
                      variant={
                        rsvp.attending === "yes" ? "default" :
                        rsvp.attending === "no" ? "destructive" : "secondary"
                      }
                    >
                      {rsvp.attending === "yes" ? "Attending" :
                       rsvp.attending === "no" ? "Declined" : "Maybe"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dietary Summary */}
      {dietaryNeeds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Dietary Needs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dietaryNeeds.map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-yellow-50 p-2">
                  <span className="font-medium text-sm">{item.name}:</span>
                  <span className="text-sm text-gray-700">{item.needs}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
