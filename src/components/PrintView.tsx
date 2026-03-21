"use client";

import type { PlanData, Party } from "@/types";
import { getThemeBySlug } from "@/lib/themes";

interface PrintViewProps {
  party: Party;
  plan: PlanData;
}

export function PrintView({ party, plan }: PrintViewProps) {
  const theme = getThemeBySlug(party.theme);

  return (
    <div className="print-view mx-auto max-w-3xl p-8">
      {/* Header */}
      <div className="mb-8 text-center border-b-4 border-party-pink pb-4">
        <p className="text-4xl mb-2">{theme?.emoji || "🎉"}</p>
        <h1 className="text-3xl font-bold text-gray-900">{plan.party_title}</h1>
        <p className="text-lg text-gray-600 mt-1">
          {party.child_name} is turning {party.child_age}!
        </p>
        {party.party_date && (
          <p className="text-gray-500 mt-1">
            {new Date(party.party_date + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <p className="text-sm text-gray-400">
          {party.headcount} guests | {party.venue_type} venue
        </p>
      </div>

      {/* Timeline */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-party-pink">Day-of Timeline</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2">
              <th className="text-left py-2 w-24">Time</th>
              <th className="text-left py-2">Activity</th>
              <th className="text-left py-2 w-16">Duration</th>
            </tr>
          </thead>
          <tbody>
            {plan.timeline.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 font-semibold">{item.time}</td>
                <td className="py-2">
                  <strong>{item.activity}</strong>
                  <br />
                  <span className="text-gray-600">{item.description}</span>
                </td>
                <td className="py-2">{item.duration_min}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Activities */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-party-pink">Activities & Games</h2>
        {plan.activities.map((activity, i) => (
          <div key={i} className="mb-3 border-l-4 border-pink-200 pl-3">
            <h3 className="font-semibold">{activity.name} ({activity.duration_min} min)</h3>
            <p className="text-sm text-gray-600">{activity.description}</p>
            <p className="text-sm"><strong>Instructions:</strong> {activity.instructions}</p>
            {activity.supplies.length > 0 && (
              <p className="text-sm text-gray-500">Supplies: {activity.supplies.join(", ")}</p>
            )}
          </div>
        ))}
      </section>

      {/* Food Menu */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-party-pink">Food & Drinks</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2">
              <th className="text-left py-2">Item</th>
              <th className="text-left py-2">Quantity</th>
              <th className="text-left py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {plan.food_menu.map((food, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 font-medium">{food.item}</td>
                <td className="py-2">{food.quantity}</td>
                <td className="py-2 text-gray-600">{food.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Shopping List */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-party-pink">Shopping List</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2">
              <th className="text-left py-2 w-8">☐</th>
              <th className="text-left py-2">Item</th>
              <th className="text-left py-2">Qty</th>
              <th className="text-left py-2">Category</th>
              <th className="text-right py-2">Est. Cost</th>
            </tr>
          </thead>
          <tbody>
            {plan.shopping_list.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-1">☐</td>
                <td className="py-1">{item.item}</td>
                <td className="py-1">{item.quantity}</td>
                <td className="py-1 capitalize">{item.category}</td>
                <td className="py-1 text-right">${item.estimated_cost?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-bold">
              <td colSpan={4} className="py-2">Estimated Total</td>
              <td className="py-2 text-right">${plan.estimated_total?.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* Tips */}
      {plan.tips.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-party-pink">Party Tips</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {plan.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-8 border-t pt-4 text-center text-xs text-gray-400">
        Generated by Partypop — AI-powered party planning
      </footer>
    </div>
  );
}
