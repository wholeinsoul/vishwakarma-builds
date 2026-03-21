"use client";

import { ThemeCard } from "./ThemeCard";
import { FALLBACK_THEMES } from "@/lib/themes";

interface ThemeGridProps {
  selectedTheme?: string;
  onSelect?: (slug: string) => void;
}

export function ThemeGrid({ selectedTheme, onSelect }: ThemeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {FALLBACK_THEMES.map((theme) => (
        <ThemeCard
          key={theme.slug}
          slug={theme.slug}
          name={theme.name}
          emoji={theme.emoji}
          description={theme.description}
          colorPrimary={theme.color_primary}
          selected={selectedTheme === theme.slug}
          onClick={() => onSelect?.(theme.slug)}
        />
      ))}
    </div>
  );
}
