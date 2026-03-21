"use client";

import { useState } from "react";
import type { ShoppingItem } from "@/types";
import { ShoppingCart, Check } from "lucide-react";

interface ShoppingListProps {
  items: ShoppingItem[];
}

export function ShoppingList({ items }: ShoppingListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const categories = ["food", "decoration", "activity", "supplies"] as const;
  const grouped = categories.reduce(
    (acc, cat) => {
      acc[cat] = items
        .map((item, index) => ({ ...item, originalIndex: index }))
        .filter((item) => item.category === cat);
      return acc;
    },
    {} as Record<string, (ShoppingItem & { originalIndex: number })[]>
  );

  const total = items.reduce((sum, item) => sum + (item.estimated_cost || 0), 0);
  const checkedTotal = items
    .filter((_, i) => checked.has(i))
    .reduce((sum, item) => sum + (item.estimated_cost || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-pink-50 p-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-party-pink" />
          <span className="font-semibold">
            {checked.size}/{items.length} items checked
          </span>
        </div>
        <span className="text-sm text-gray-600">
          ${checkedTotal.toFixed(2)} / ${total.toFixed(2)}
        </span>
      </div>

      {categories.map((category) => {
        const categoryItems = grouped[category];
        if (!categoryItems || categoryItems.length === 0) return null;
        return (
          <div key={category}>
            <h4 className="mb-2 font-semibold capitalize text-gray-700">
              {category === "food" ? "🍕 Food & Drinks" :
               category === "decoration" ? "🎈 Decorations" :
               category === "activity" ? "🎯 Activities" : "📦 Supplies"}
            </h4>
            <div className="space-y-1">
              {categoryItems.map((item) => (
                <button
                  key={item.originalIndex}
                  type="button"
                  onClick={() => toggle(item.originalIndex)}
                  className="flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors hover:bg-gray-50"
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      checked.has(item.originalIndex)
                        ? "border-party-pink bg-party-pink text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {checked.has(item.originalIndex) && <Check className="h-3 w-3" />}
                  </div>
                  <span
                    className={`flex-1 text-sm ${
                      checked.has(item.originalIndex) ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {item.item}
                  </span>
                  <span className="text-xs text-gray-500">{item.quantity}</span>
                  <span className="text-xs font-medium text-gray-700">
                    ${item.estimated_cost?.toFixed(2) ?? "0.00"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
