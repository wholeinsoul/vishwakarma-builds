"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, PartyPopper } from "lucide-react";

interface RsvpFormProps {
  partyId: string;
  partyTitle: string;
  childName: string;
  theme: string;
  themeEmoji: string;
  slug: string;
}

export function RsvpForm({ partyId, partyTitle, childName, theme, themeEmoji, slug }: RsvpFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    attending: "yes" as "yes" | "no" | "maybe",
    num_children: 1,
    dietary_needs: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_id: partyId,
          guest_name: formData.guest_name,
          guest_email: formData.guest_email || null,
          attending: formData.attending,
          num_children: formData.num_children,
          dietary_needs: formData.dietary_needs || null,
          notes: formData.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit RSVP");
      }

      router.push(`/rsvp/${slug}/confirmed`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <span className="text-5xl">{themeEmoji}</span>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          You&apos;re Invited!
        </h1>
        <p className="text-lg text-gray-600">{partyTitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-party-pink" />
            RSVP for {childName}&apos;s Party
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guest_name">Your Name *</Label>
              <Input
                id="guest_name"
                required
                value={formData.guest_name}
                onChange={(e) => setFormData((p) => ({ ...p, guest_name: e.target.value }))}
                placeholder="Jane Smith"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="guest_email">Email (optional)</Label>
              <Input
                id="guest_email"
                type="email"
                value={formData.guest_email}
                onChange={(e) => setFormData((p) => ({ ...p, guest_email: e.target.value }))}
                placeholder="jane@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Will you attend? *</Label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {[
                  { value: "yes", label: "Yes!", emoji: "🎉" },
                  { value: "maybe", label: "Maybe", emoji: "🤔" },
                  { value: "no", label: "Can't make it", emoji: "😢" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, attending: option.value as "yes" | "no" | "maybe" }))}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      formData.attending === option.value
                        ? "border-party-pink bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl">{option.emoji}</span>
                    <p className="text-sm font-medium">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {formData.attending !== "no" && (
              <div>
                <Label htmlFor="num_children">Number of kids attending</Label>
                <Input
                  id="num_children"
                  type="number"
                  min={0}
                  max={20}
                  value={formData.num_children}
                  onChange={(e) => setFormData((p) => ({ ...p, num_children: parseInt(e.target.value) || 1 }))}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="dietary_needs">Dietary Needs / Allergies</Label>
              <Input
                id="dietary_needs"
                value={formData.dietary_needs}
                onChange={(e) => setFormData((p) => ({ ...p, dietary_needs: e.target.value }))}
                placeholder="e.g., nut allergy, vegetarian"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="e.g., arriving 15 min late"
                className="mt-1"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !formData.guest_name}
              className="w-full bg-party-pink hover:bg-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending RSVP...
                </>
              ) : (
                "Send RSVP"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
