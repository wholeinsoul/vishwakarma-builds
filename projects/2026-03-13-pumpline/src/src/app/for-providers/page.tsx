import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'List Your Septic Business',
  description:
    'Get your septic service business listed on Pumpline for free. Reach more customers, collect reviews, and grow your business with our provider directory.',
  openGraph: {
    title: 'List Your Septic Business | Pumpline',
    description:
      'Get your septic service business listed on Pumpline for free. Reach more customers, collect reviews, and grow your business.',
  },
};

const benefits = [
  {
    title: 'Free Business Listing',
    description:
      'Create your provider profile at no cost. Include your services, service area, pricing, and contact information to start reaching new customers.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Customer Reviews',
    description:
      'Build trust with verified customer reviews. Positive reviews help new customers choose your business over competitors.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: 'SEO-Optimized Profile',
    description:
      'Your business profile is built to rank in search engines. When homeowners search for septic services in your area, they find you.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: 'Direct Customer Contact',
    description:
      'No middleman. Customers see your phone number and call you directly. No lead fees, no commissions, no surprise charges.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    title: 'Premium Features',
    description:
      'Upgrade to a premium listing for priority placement, a highlighted profile, and a verified badge that builds customer confidence.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    title: 'Claim Existing Listings',
    description:
      'Already listed on Pumpline? Claim your profile to update your information, respond to reviews, and manage your online presence.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export default function ForProvidersPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-20">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 text-balance">
          Grow Your Septic Business with{' '}
          <span className="text-orange-500">Pumpline</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
          Join the directory that connects septic service providers with
          homeowners who need you. Free to list, no commissions, no lead fees.
        </p>
        <a
          href="mailto:providers@pumpline.com?subject=Claim%20or%20List%20My%20Business"
          className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-colors"
        >
          Claim Your Listing
        </a>
      </section>

      {/* Benefits Grid */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          Why List on Pumpline?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-orange-500/30 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-500 font-bold text-lg">1</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Claim or Create
            </h3>
            <p className="text-sm text-zinc-400">
              Search for your business on Pumpline. If you are already listed,
              claim it. If not, we will create your profile.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-500 font-bold text-lg">2</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Complete Your Profile
            </h3>
            <p className="text-sm text-zinc-400">
              Add your services, service area, pricing, photos, and contact
              details. The more complete your profile, the better.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-500 font-bold text-lg">3</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Start Getting Calls
            </h3>
            <p className="text-sm text-zinc-400">
              Homeowners find your listing, read your reviews, and call you
              directly. No middleman, no commission.
            </p>
          </div>
        </div>
      </section>

      {/* Free vs Premium */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          Free vs Premium Listing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-1">Free</h3>
            <p className="text-2xl font-bold text-orange-500 mb-6">$0/month</p>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Business profile page
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Customer reviews
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Phone number display
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                SEO-optimized listing
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-zinc-500">Priority placement</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-zinc-500">Premium badge</span>
              </li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-orange-500/30 rounded-lg p-6 ring-1 ring-orange-500/10">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-white">Premium</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                Recommended
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-500 mb-6">
              Coming Soon
            </p>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Everything in Free
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Priority placement in search
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Premium badge on listing
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Highlighted profile card
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Verified business badge
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Analytics dashboard
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-zinc-900 border border-zinc-800 rounded-lg p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Ready to Reach More Customers?
        </h2>
        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
          Join Pumpline today and start connecting with homeowners who need your
          septic services. It takes less than 5 minutes to get started.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:providers@pumpline.com?subject=Claim%20or%20List%20My%20Business"
            className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Claim Your Listing
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            Search the Directory
          </Link>
        </div>
      </section>
    </div>
  );
}
