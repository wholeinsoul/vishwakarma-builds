import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  Bell,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "10 Major Banks",
    description:
      "Pre-populated POA requirements for Chase, BofA, Wells Fargo, Citi, US Bank, PNC, Capital One, TD Bank, Truist, and Regions.",
  },
  {
    icon: ClipboardCheck,
    title: "Document Checklists",
    description:
      "Interactive checklists for each bank so you never miss a required document or form.",
  },
  {
    icon: AlertTriangle,
    title: "Submission Tracker",
    description:
      "Track each POA submission status from preparation through approval or rejection.",
  },
  {
    icon: Bell,
    title: "Renewal Alerts",
    description:
      "Get notified before your POA expires so you can start the renewal process early.",
  },
  {
    icon: Users,
    title: "Community Reports",
    description:
      "Learn from others' rejection experiences. Vote on reports to surface the most common issues.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your submission data is private and secured with Supabase authentication and row-level security.",
  },
];

const steps = [
  {
    num: "1",
    title: "Find Your Bank",
    description: "Browse POA requirements for 10 major US banks.",
  },
  {
    num: "2",
    title: "Generate Checklist",
    description: "Get a personalized document checklist for your submission.",
  },
  {
    num: "3",
    title: "Track & Submit",
    description: "Track your submission progress and get renewal alerts.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-amber-400/20 p-4 rounded-2xl">
                <Shield className="h-12 w-12 text-amber-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Get Your POA Accepted at Every Bank. First Try. Guaranteed.
            </h1>
            <p className="text-xl text-navy-200 mb-8 text-balance">
              Our concierge service handles everything — $399, done in 48 hours.
              Bank-specific requirements verified. 90%+ first-try acceptance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/intake">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold text-lg px-8"
                >
                  Start Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/banks">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-navy-300 text-white hover:bg-navy-500 text-lg px-8"
                >
                  Browse Banks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-navy-700 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-amber-400 text-navy-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-navy-700 mb-2">
                  {step.title}
                </h3>
                <p className="text-navy-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-navy-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-navy-700 mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-navy-100 hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <feature.icon className="h-10 w-10 text-amber-500 mb-4" />
                  <h3 className="font-semibold text-navy-700 text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-navy-400 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-navy-700 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-center text-navy-400 mb-12 max-w-2xl mx-auto">
            Browse requirements for free, or get full concierge service with
            guaranteed acceptance.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="border-navy-200">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-navy-700 mb-2">Free</h3>
                <p className="text-navy-400 mb-6">
                  Self-service POA requirements
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Browse bank requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Track your own submissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Community rejection reports</span>
                  </li>
                </ul>
                <Link href="/banks">
                  <Button
                    variant="outline"
                    className="w-full border-navy-300 text-navy-700 hover:bg-navy-50"
                  >
                    Browse Banks
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Concierge Tier */}
            <Card className="border-amber-500 border-2 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-navy-900 px-4 py-1 rounded-full text-sm font-bold">
                RECOMMENDED
              </div>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-navy-700 mb-2">
                  POA Autopilot
                </h3>
                <p className="text-navy-400 mb-2">Full concierge service</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-navy-700">$399</span>
                  <span className="text-navy-400"> one-time</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>Everything in Free, plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Bank-specific research</strong> for your POA
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Document prep guidance</strong> and checklist
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>48-hour turnaround</strong> guarantee
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Unlimited revisions</strong> if rejected
                    </span>
                  </li>
                </ul>
                <Link href="/intake">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold">
                    Start Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Ready to Simplify Your POA Process?
          </h2>
          <p className="text-navy-200 mb-8 max-w-2xl mx-auto">
            Join ConcretePOA today and get access to comprehensive bank
            requirements, submission tracking, and community insights.
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold text-lg px-8"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
