import Link from "next/link";
import { FALLBACK_THEMES } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function ThemesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Party Themes</h1>
        <p className="mt-2 text-gray-600">
          Choose from 10 carefully curated themes, each with tailored activities, decorations, and food ideas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {FALLBACK_THEMES.map((theme) => (
          <Card key={theme.slug} className="overflow-hidden transition-shadow hover:shadow-lg">
            <CardContent className="p-0">
              <div
                className="flex items-center gap-4 p-6"
                style={{
                  background: `linear-gradient(135deg, ${theme.color_primary}15, ${theme.color_secondary}15)`,
                }}
              >
                <span className="text-5xl">{theme.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{theme.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{theme.description}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Ages {theme.age_min}–{theme.age_max}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: theme.color_primary }}
                    />
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: theme.color_secondary }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">
          Ready to plan a party?
        </h3>
        <Link href="/plan/new">
          <Button size="lg" className="bg-party-pink hover:bg-pink-600">
            Start Planning
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
