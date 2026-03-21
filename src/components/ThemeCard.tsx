"use client";

import { cn } from "@/lib/utils";

interface ThemeCardProps {
  slug: string;
  name: string;
  emoji: string;
  description: string | null;
  colorPrimary: string;
  selected?: boolean;
  onClick?: () => void;
}

export function ThemeCard({ slug, name, emoji, description, colorPrimary, selected, onClick }: ThemeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:shadow-lg",
        selected
          ? "border-party-pink bg-pink-50 shadow-md ring-2 ring-party-pink"
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <span className="text-4xl">{emoji}</span>
      <h3 className="font-semibold text-gray-900">{name}</h3>
      {description && (
        <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
      )}
      <div
        className="absolute top-2 right-2 h-3 w-3 rounded-full"
        style={{ backgroundColor: colorPrimary }}
      />
      {selected && (
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-party-pink text-white text-xs">
          ✓
        </div>
      )}
    </button>
  );
}
