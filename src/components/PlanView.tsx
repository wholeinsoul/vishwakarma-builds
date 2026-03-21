"use client";

import type { PlanData } from "@/types";
import { Timeline } from "./Timeline";
import { ShoppingList } from "./ShoppingList";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Utensils, Palette, Lightbulb, DollarSign } from "lucide-react";

interface PlanViewProps {
  plan: PlanData;
}

export function PlanView({ plan }: PlanViewProps) {
  return (
    <div className="space-y-6">
      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">⏰</span> Day-of Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline items={plan.timeline} />
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span> Activities & Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {plan.activities.map((activity, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                  <Badge variant="secondary">{activity.duration_min} min</Badge>
                </div>
                <p className="mb-2 text-sm text-gray-600">{activity.description}</p>
                <p className="text-sm text-gray-700">
                  <strong>How to:</strong> {activity.instructions}
                </p>
                {activity.supplies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {activity.supplies.map((supply, i) => (
                      <span key={i} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        {supply}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Food Menu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-orange-500" /> Food & Drinks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {plan.food_menu.map((food, index) => (
              <div key={index} className="flex items-center justify-between py-3">
                <div>
                  <span className="font-medium text-gray-900">{food.item}</span>
                  {food.notes && (
                    <p className="text-xs text-gray-500">{food.notes}</p>
                  )}
                </div>
                <span className="text-sm text-gray-600">{food.quantity}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Decorations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-purple-500" /> Decorations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {plan.decorations.map((deco, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                <span className="font-medium text-gray-900">{deco.item}</span>
                <div className="text-right">
                  <span className="text-sm text-gray-600">x{deco.quantity}</span>
                  <span className="ml-2 text-sm font-medium text-purple-700">
                    ${deco.estimated_cost?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shopping List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🛒</span> Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ShoppingList items={plan.shopping_list} />
        </CardContent>
      </Card>

      {/* Tips */}
      {plan.tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" /> Party Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.tips.map((tip, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <span className="shrink-0 text-yellow-500">💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Estimated Total */}
      <Card className="border-party-pink bg-pink-50">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-party-pink" />
            <span className="text-lg font-semibold">Estimated Total</span>
          </div>
          <span className="text-2xl font-bold text-party-pink">
            ${plan.estimated_total?.toFixed(2)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
