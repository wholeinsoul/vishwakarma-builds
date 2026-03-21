import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/PricingCard";
import { FALLBACK_THEMES } from "@/lib/themes";
import { Sparkles, Clock, ShoppingCart, Users, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mb-4 inline-block rounded-full bg-pink-100 px-4 py-1 text-sm font-medium text-party-pink">
            AI-Powered Party Planning
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Plan the Perfect{" "}
            <span className="bg-gradient-to-r from-party-pink to-party-purple bg-clip-text text-transparent">
              Kids&apos; Birthday Party
            </span>
            {" "}in Minutes
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Partypop uses AI to generate complete party plans with timelines, activities,
            food menus, shopping lists, and RSVP tracking. Choose from 10 fun themes!
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/plan/new">
              <Button size="lg" className="bg-gradient-to-r from-party-pink to-party-purple text-lg hover:opacity-90">
                <Sparkles className="mr-2 h-5 w-5" />
                Plan a Party — Free
              </Button>
            </Link>
            <Link href="/themes">
              <Button size="lg" variant="outline" className="text-lg">
                Browse Themes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute left-10 top-10 text-4xl opacity-20 animate-bounce">🎈</div>
        <div className="absolute right-20 top-20 text-4xl opacity-20 animate-bounce delay-100">🎂</div>
        <div className="absolute left-1/4 bottom-10 text-4xl opacity-20 animate-bounce delay-200">🎁</div>
        <div className="absolute right-1/4 bottom-20 text-4xl opacity-20 animate-bounce delay-300">🎊</div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Everything You Need for the Perfect Party
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                icon: <Sparkles className="h-8 w-8 text-party-pink" />,
                title: "AI-Generated Plans",
                desc: "Get a complete party plan with activities, food, and decorations tailored to your theme.",
              },
              {
                icon: <Clock className="h-8 w-8 text-party-purple" />,
                title: "Day-of Timeline",
                desc: "A minute-by-minute schedule so your party runs smoothly from start to finish.",
              },
              {
                icon: <ShoppingCart className="h-8 w-8 text-party-blue" />,
                title: "Smart Shopping List",
                desc: "An organized shopping list with quantities and estimated costs. Check items as you go!",
              },
              {
                icon: <Users className="h-8 w-8 text-party-green" />,
                title: "RSVP Tracking",
                desc: "Share a link with guests, collect RSVPs, and track dietary needs all in one place.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-white p-6 text-center">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-900">
            10 Magical Themes
          </h2>
          <p className="mb-10 text-center text-gray-600">
            Each theme comes with curated activities, decorations, and food ideas.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {FALLBACK_THEMES.map((theme) => (
              <div
                key={theme.slug}
                className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center transition-transform hover:scale-105"
              >
                <span className="text-4xl">{theme.emoji}</span>
                <h3 className="text-sm font-semibold text-gray-900">{theme.name}</h3>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/themes">
              <Button variant="outline">
                View All Themes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-900">
            Simple Pricing
          </h2>
          <p className="mb-10 text-center text-gray-600">
            Your first party plan is free. Upgrade for RSVP tracking and more.
          </p>
          <PricingCard />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-party-pink to-party-purple py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Plan an Amazing Party?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of parents who&apos;ve planned stress-free birthday parties with Partypop.
          </p>
          <Link href="/plan/new">
            <Button size="lg" className="bg-white text-party-pink hover:bg-gray-100 text-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Planning Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
