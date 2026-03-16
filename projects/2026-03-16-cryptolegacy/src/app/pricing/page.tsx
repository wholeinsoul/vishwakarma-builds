import Link from "next/link";
import { Shield, CheckCircle, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "$9",
    description: "Everything you need to protect one recovery plan.",
    features: [
      "1 recovery plan",
      "Up to 3 beneficiaries",
      "All platform templates",
      "Email notifications",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$29",
    description: "For those with multiple wallets and platforms to protect.",
    features: [
      "Unlimited recovery plans",
      "Unlimited beneficiaries",
      "All platform templates",
      "Priority email support",
    ],
    cta: "Get Started",
    highlighted: true,
  },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time from your account settings. Your plan will remain active until the end of the current billing period.",
  },
  {
    q: "What happens to my plans if I cancel?",
    a: "Your recovery plans are paused (not deleted) when your subscription lapses. The dead man's switch stops running. If you resubscribe, everything reactivates automatically with a fresh check-in timer.",
  },
  {
    q: "Do you offer a free trial?",
    a: "We do not offer a free trial, but you can explore the platform and set up your plan before subscribing. Encryption is performed client-side, so your data is always secure.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time. When upgrading, you get immediate access to the new plan's features. When downgrading, the change takes effect at the next billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through our payment partner, Stripe. All transactions are securely processed.",
  },
  {
    q: "Is there a refund policy?",
    a: "We offer a 14-day money-back guarantee. If you are not satisfied with the service, contact our support team within 14 days of your first payment for a full refund.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <Shield className="h-6 w-6 text-primary" />
            CryptoLegacy
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-sm font-medium text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Protect your crypto legacy with plans that fit your needs. No hidden
            fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlighted
                    ? "rounded-lg border-2 border-primary p-8 relative"
                    : "rounded-lg border p-8"
                }
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                    Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signup"
                  className={
                    plan.highlighted
                      ? "mt-8 w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      : "mt-8 w-full inline-flex items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-accent"
                  }
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Billing FAQ
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Protect Your Crypto Legacy?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Set up your encrypted recovery plan in under 10 minutes. Your loved
            ones will thank you.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            CryptoLegacy &copy; {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/auth/login" className="hover:text-foreground">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
