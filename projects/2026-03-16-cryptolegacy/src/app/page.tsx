import Link from "next/link";
import {
  Shield,
  Clock,
  Users,
  Lock,
  CheckCircle,
  ArrowRight,
  Zap,
  Eye,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-primary" />
            CryptoLegacy
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground"
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
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm mb-6">
            <Lock className="h-3.5 w-3.5 mr-2" />
            Zero-knowledge encryption — we never see your data
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
            Don&apos;t Let Your Crypto
            <span className="text-primary"> Die With You</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Create encrypted recovery plans for your crypto assets. If something
            happens to you, your loved ones get step-by-step instructions to
            access your funds. Automatically.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create Your Recovery Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-md border px-8 py-3 text-sm font-medium hover:bg-accent"
            >
              See How It Works
              <ChevronDown className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 border-y bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">AES-256</div>
              <div className="text-sm text-muted-foreground">
                Military-grade encryption
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">Zero</div>
              <div className="text-sm text-muted-foreground">
                Knowledge architecture
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">Client-side</div>
              <div className="text-sm text-muted-foreground">
                Encryption only
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">Open</div>
              <div className="text-sm text-muted-foreground">
                Source auditable
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three simple steps to protect your loved ones
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                1. Create Your Plan
              </h3>
              <p className="text-muted-foreground text-sm">
                Use our guided wizard to create step-by-step recovery
                instructions for each of your crypto platforms. Everything is
                encrypted in your browser.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                2. Check In Regularly
              </h3>
              <p className="text-muted-foreground text-sm">
                Set a check-in interval (30, 60, or 90 days). Just click a
                button or link in your email to confirm you&apos;re still
                around.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                3. Automatic Delivery
              </h3>
              <p className="text-muted-foreground text-sm">
                If you miss check-ins, your beneficiaries automatically receive
                access to your encrypted recovery plan with the passphrase you
                shared with them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Security
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Lock,
                title: "Zero-Knowledge Encryption",
                desc: "Your recovery plans are encrypted in your browser with AES-256-GCM. We never see your plaintext data. Ever.",
              },
              {
                icon: Eye,
                title: "Dead Man's Switch",
                desc: "Configurable check-in intervals with a 3-week escalation chain: reminder, urgent warning, then trigger.",
              },
              {
                icon: Shield,
                title: "Platform Templates",
                desc: "Pre-built guides for Coinbase, Binance, MetaMask, Ledger, and more. Your beneficiaries get clear, step-by-step instructions.",
              },
              {
                icon: Users,
                title: "Multiple Beneficiaries",
                desc: "Add as many beneficiaries as you need. Each gets a unique, secure access link.",
              },
              {
                icon: CheckCircle,
                title: "Passphrase Protection",
                desc: "Even if someone intercepts the link, they need the passphrase you shared out-of-band to decrypt.",
              },
              {
                icon: Zap,
                title: "Simple Recovery",
                desc: "Your beneficiaries don't need to be technical. They enter the passphrase and get clear instructions.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6"
              >
                <feature.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground mb-8">
            Protect your crypto legacy starting at $9/month
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold text-lg">Basic</h3>
              <div className="text-3xl font-bold mt-2">
                $9<span className="text-lg text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />1 recovery
                  plan
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Up to 3 beneficiaries
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  All platform templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Email notifications
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="mt-6 w-full inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Get Started
              </Link>
            </div>
            <div className="rounded-lg border-2 border-primary p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="font-semibold text-lg">Premium</h3>
              <div className="text-3xl font-bold mt-2">
                $29<span className="text-lg text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Unlimited recovery plans
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Unlimited beneficiaries
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  All platform templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Priority email support
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="mt-6 w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can you read my recovery plans?",
                a: "No. Your plans are encrypted in your browser using AES-256-GCM before being sent to our servers. We only store encrypted data. Without your passphrase, the data is meaningless.",
              },
              {
                q: "What happens if I lose my passphrase?",
                a: "There is no password reset. We cannot recover your plan without the passphrase. This is by design — it means nobody, including us, can access your data without your explicit consent.",
              },
              {
                q: "How does the dead man's switch work?",
                a: "You set a check-in interval (e.g., 90 days). If you miss a check-in, we send you a reminder. After 7 more days, an urgent warning. After 14 days total, your beneficiaries receive their access links.",
              },
              {
                q: "Do my beneficiaries need an account?",
                a: "No. They receive an email with a unique link. They just enter the passphrase you shared with them to decrypt and view the recovery instructions.",
              },
              {
                q: "What if I cancel my subscription?",
                a: "Your plan is paused (not deleted). The dead man's switch stops checking. If you resubscribe, everything reactivates with a fresh timer.",
              },
            ].map((item) => (
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
            Protect Your Crypto Legacy Today
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Don&apos;t wait until it&apos;s too late. Set up your encrypted
            recovery plan in under 10 minutes.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get Started Free
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
