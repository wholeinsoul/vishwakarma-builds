"use client";

import type { TimelineItem } from "@/types";
import { Clock } from "lucide-react";

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={index} className="relative flex gap-4 pb-6">
          {/* Vertical line */}
          {index < items.length - 1 && (
            <div className="absolute left-[19px] top-10 h-full w-0.5 bg-pink-200" />
          )}
          {/* Time bubble */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-party-pink text-white">
            <Clock className="h-4 w-4" />
          </div>
          {/* Content */}
          <div className="flex-1 rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-party-pink">{item.time}</span>
              <span className="text-xs text-gray-400">{item.duration_min} min</span>
            </div>
            <h4 className="font-semibold text-gray-900">{item.activity}</h4>
            <p className="text-sm text-gray-600">{item.description}</p>
            {item.supplies_needed.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {item.supplies_needed.map((supply, i) => (
                  <span key={i} className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-700">
                    {supply}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
