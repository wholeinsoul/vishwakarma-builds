import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Pumpline',
  description:
    'Pumpline helps rural homeowners find trusted septic service providers. Learn about our mission to make septic system maintenance easier and more transparent.',
  openGraph: {
    title: 'About Pumpline',
    description:
      'Pumpline helps rural homeowners find trusted septic service providers. Learn about our mission to make septic system maintenance easier and more transparent.',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
        About <span className="text-orange-500">Pumpline</span>
      </h1>

      <div className="space-y-8 text-zinc-300 leading-relaxed">
        {/* Mission */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Our Mission</h2>
          <p className="mb-4">
            Pumpline exists to help rural homeowners find trusted, reliable
            septic service providers. For the roughly 20% of American homes that
            rely on septic systems, finding a qualified professional should not
            mean scrolling through outdated directories, guessing at prices, or
            relying on word of mouth alone.
          </p>
          <p>
            We are building a modern, transparent directory where homeowners can
            compare providers, read honest reviews, and make confident decisions
            about one of their home&apos;s most critical systems.
          </p>
        </section>

        {/* The Problem */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            The Problem We Solve
          </h2>
          <p className="mb-4">
            Septic system maintenance is one of those things most homeowners do
            not think about until something goes wrong. When it does, the search
            for help can be stressful:
          </p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1 shrink-0">-</span>
              Most major review sites focus on urban areas, leaving rural
              communities underserved.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1 shrink-0">-</span>
              Pricing for septic services is opaque, making it hard to know
              what is fair.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1 shrink-0">-</span>
              Many homeowners do not know how often to pump, what warning signs
              to watch for, or when to call for help.
            </li>
          </ul>
          <p>
            Pumpline bridges these gaps by organizing septic providers by county,
            providing real customer reviews, and offering free educational
            resources like our{' '}
            <Link
              href="/checklist"
              className="text-orange-500 hover:text-orange-400 transition-colors"
            >
              Septic Maintenance Checklist
            </Link>
            .
          </p>
        </section>

        {/* What We Believe */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            What We Believe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-orange-500 font-medium mb-1">
                Transparency First
              </h3>
              <p className="text-sm text-zinc-400">
                Honest reviews, real pricing ranges, and no pay-to-play
                rankings. Free listings always appear alongside premium ones.
              </p>
            </div>
            <div>
              <h3 className="text-orange-500 font-medium mb-1">
                Rural Communities Matter
              </h3>
              <p className="text-sm text-zinc-400">
                One in five American homes uses a septic system. These
                communities deserve the same quality of service-discovery tools
                as urban areas.
              </p>
            </div>
            <div>
              <h3 className="text-orange-500 font-medium mb-1">
                Education Prevents Problems
              </h3>
              <p className="text-sm text-zinc-400">
                A homeowner who understands their septic system avoids costly
                emergencies. We invest in free resources to help people maintain
                their systems.
              </p>
            </div>
            <div>
              <h3 className="text-orange-500 font-medium mb-1">
                Providers Are Partners
              </h3>
              <p className="text-sm text-zinc-400">
                We succeed when local providers succeed. Our directory is
                designed to help good businesses get found by the customers who
                need them.
              </p>
            </div>
          </div>
        </section>

        {/* For Providers */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-3">
            Are You a Septic Service Provider?
          </h2>
          <p className="text-zinc-400 mb-6">
            List your business on Pumpline for free and start connecting with
            homeowners in your area.
          </p>
          <Link
            href="/for-providers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            Learn More
          </Link>
        </section>
      </div>
    </div>
  );
}
