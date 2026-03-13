import type { Metadata } from 'next';
import EmailCapture from '@/components/EmailCapture';

export const metadata: Metadata = {
  title: 'Free Septic Maintenance Checklist',
  description:
    'Download our free septic system maintenance checklist. Learn how often to pump, warning signs to watch for, and tips to extend the life of your septic system.',
  openGraph: {
    title: 'Free Septic Maintenance Checklist | Pumpline',
    description:
      'Download our free septic system maintenance checklist. Learn how often to pump, warning signs to watch for, and tips to extend the life of your septic system.',
  },
};

const warningSignItems = [
  'Slow-draining sinks, tubs, or toilets throughout the house',
  'Gurgling sounds in the plumbing system',
  'Sewage odors near the drain field or inside the home',
  'Standing water or soggy spots over the drain field',
  'Unusually lush, green grass over the septic area',
  'Sewage backup in toilets, drains, or basement',
];

const doItems = [
  'Have your tank pumped every 3 to 5 years',
  'Keep records of pumping, inspections, and repairs',
  'Use water efficiently to reduce the load on your system',
  'Fix leaky faucets and running toilets promptly',
  'Divert roof drains and surface water away from the drain field',
  'Know the location of your septic tank and drain field',
  'Have your system inspected at least every 3 years',
];

const dontItems = [
  'Flush non-biodegradable items (wipes, feminine products, diapers)',
  'Pour grease, oil, or fat down the drain',
  'Use excessive amounts of household chemicals or bleach',
  'Drive or park vehicles over your septic tank or drain field',
  'Plant trees or shrubs near the septic system',
  'Connect a garbage disposal without more frequent pumpings',
  'Ignore signs of system failure',
];

export default function ChecklistPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Septic System{' '}
          <span className="text-orange-500">Maintenance Checklist</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          A well-maintained septic system protects your property, your family,
          and the environment. Use this checklist to keep your system running
          smoothly for decades.
        </p>
      </div>

      {/* Email Capture - Prominent Placement */}
      <div className="max-w-lg mx-auto mb-16">
        <EmailCapture
          source="checklist"
          title="Get the Printable PDF Checklist"
          description="Enter your email to receive a printer-friendly version of this checklist plus seasonal maintenance reminders."
        />
      </div>

      {/* Pumping Schedule */}
      <section className="mb-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 text-sm font-bold">
              1
            </span>
            Pumping Schedule
          </h2>
          <p className="text-zinc-400 mb-4">
            The single most important thing you can do for your septic system is
            to have it pumped on a regular schedule. Most households need
            pumping every <strong className="text-white">3 to 5 years</strong>,
            but this depends on several factors:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-orange-500 mb-2">
                Pump More Often If
              </h3>
              <ul className="text-sm text-zinc-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">-</span>
                  Large household (4+ people)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">-</span>
                  Smaller tank (under 1,000 gallons)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">-</span>
                  Garbage disposal use
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">-</span>
                  Heavy water usage
                </li>
              </ul>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-orange-500 mb-2">
                Pump Less Often If
              </h3>
              <ul className="text-sm text-zinc-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">-</span>
                  Small household (1-2 people)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">-</span>
                  Larger tank (1,500+ gallons)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">-</span>
                  Water-efficient fixtures
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">-</span>
                  No garbage disposal
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Signs */}
      <section className="mb-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 text-sm font-bold">
              2
            </span>
            Warning Signs of Septic Problems
          </h2>
          <p className="text-zinc-400 mb-4">
            Watch for these red flags that indicate your system may need
            immediate attention. Catching problems early can save thousands in
            repair costs.
          </p>
          <ul className="space-y-3">
            {warningSignItems.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <span className="text-zinc-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Do's and Don'ts */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-500 text-sm font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              Do
            </h2>
            <ul className="space-y-3">
              {doItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-zinc-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 text-sm font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              Don&apos;t
            </h2>
            <ul className="space-y-3">
              {dontItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-400 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-zinc-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Seasonal Tips */}
      <section className="mb-16">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 text-sm font-bold">
              3
            </span>
            Seasonal Tips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-orange-500 mb-2">
                Spring / Summer
              </h3>
              <ul className="text-sm text-zinc-400 space-y-1.5">
                <li>- Inspect the drain field for wet spots</li>
                <li>- Check that covers and lids are secure</li>
                <li>- Schedule pumping if due</li>
                <li>- Redirect sprinklers away from drain field</li>
              </ul>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-orange-500 mb-2">
                Fall / Winter
              </h3>
              <ul className="text-sm text-zinc-400 space-y-1.5">
                <li>- Have an inspection before ground freezes</li>
                <li>- Insulate exposed pipes in cold climates</li>
                <li>- Avoid compacting snow over the drain field</li>
                <li>- Keep holiday water usage in check</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Need a Septic Professional?
        </h2>
        <p className="text-zinc-400 mb-6">
          Find trusted, reviewed septic service providers in your area.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          Find Providers Near You
        </a>
      </div>
    </div>
  );
}
