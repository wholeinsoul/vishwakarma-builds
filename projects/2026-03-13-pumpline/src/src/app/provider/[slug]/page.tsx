import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import StarRating from '@/components/StarRating';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import { supabase } from '@/lib/supabase';
import { localBusinessJsonLd, getBaseUrl } from '@/lib/seo';
import type { Provider, Review } from '@/types';

export const revalidate = 1800;

interface PageProps {
  params: { slug: string };
}

async function getProviderBySlug(slug: string): Promise<Provider | null> {
  const { data } = await supabase
    .from('providers')
    .select('*, county:counties(*)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  return data as Provider | null;
}

async function getApprovedReviews(providerId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', providerId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  return (data as Review[]) || [];
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('providers')
    .select('slug')
    .eq('status', 'active');
  return (data || []).map((provider) => ({ slug: provider.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const provider = await getProviderBySlug(params.slug);
  if (!provider) return {};

  const county = provider.county;
  const ratingText =
    provider.review_count > 0
      ? ` | ${provider.avg_rating.toFixed(1)} stars (${provider.review_count} reviews)`
      : '';
  const locationText = county ? ` in ${county.name}, ${county.state_full}` : '';
  const title = `${provider.name}${locationText}`;
  const description = `${provider.name}${locationText}${ratingText}. ${provider.description || `Septic services including ${provider.services.join(', ')}.`}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${getBaseUrl()}/provider/${provider.slug}`,
    },
  };
}

export default async function ProviderPage({ params }: PageProps) {
  const provider = await getProviderBySlug(params.slug);
  if (!provider) notFound();

  const county = provider.county;
  const reviews = await getApprovedReviews(provider.id);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...(county
      ? [
          { label: county.state_full, href: `/#${county.state.toLowerCase()}` },
          { label: county.name, href: `/county/${county.slug}` },
        ]
      : []),
    { label: provider.name },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      {county && (
        <JsonLd data={localBusinessJsonLd(provider, county, reviews)} />
      )}

      {/* Provider Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {provider.name}
              </h1>
              {provider.is_premium && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  Premium
                </span>
              )}
              {provider.is_verified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                  Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={provider.avg_rating} />
              <span className="text-zinc-300">
                {provider.avg_rating > 0
                  ? provider.avg_rating.toFixed(1)
                  : 'No ratings yet'}
              </span>
              {provider.review_count > 0 && (
                <span className="text-zinc-500">
                  ({provider.review_count} review
                  {provider.review_count !== 1 ? 's' : ''})
                </span>
              )}
            </div>

            {provider.description && (
              <p className="text-zinc-400 mb-4 leading-relaxed">
                {provider.description}
              </p>
            )}

            {!provider.is_claimed && (
              <p className="text-sm text-zinc-500">
                Is this your business?{' '}
                <Link
                  href="/for-providers"
                  className="text-orange-500 hover:text-orange-400 transition-colors underline"
                >
                  Claim this listing
                </Link>
              </p>
            )}
          </div>

          <div className="shrink-0 flex flex-col gap-3">
            {provider.phone && (
              <a
                href={`tel:${provider.phone.replace(/[^\d+]/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                {provider.phone}
              </a>
            )}
            {provider.website && (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.5 8.018"
                  />
                </svg>
                Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Provider Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Services */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Services</h2>
          {provider.services.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {provider.services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-500/10 text-orange-400 border border-orange-500/20 capitalize"
                >
                  {service}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No services listed.</p>
          )}
        </div>

        {/* Business Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Business Info
          </h2>
          <dl className="space-y-3">
            {provider.pricing_range && (
              <div>
                <dt className="text-sm text-zinc-500">Pricing</dt>
                <dd className="text-zinc-300">{provider.pricing_range}</dd>
              </div>
            )}
            {provider.response_time && (
              <div>
                <dt className="text-sm text-zinc-500">Response Time</dt>
                <dd className="text-zinc-300">{provider.response_time}</dd>
              </div>
            )}
            {provider.years_in_biz && (
              <div>
                <dt className="text-sm text-zinc-500">Years in Business</dt>
                <dd className="text-zinc-300">{provider.years_in_biz} years</dd>
              </div>
            )}
            {provider.license_number && (
              <div>
                <dt className="text-sm text-zinc-500">License #</dt>
                <dd className="text-zinc-300">{provider.license_number}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Service Area */}
        {provider.service_area && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Service Area
            </h2>
            <p className="text-zinc-300">{provider.service_area}</p>
          </div>
        )}

        {/* Contact & Address */}
        {(provider.address || provider.email) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Contact</h2>
            <dl className="space-y-3">
              {provider.address && (
                <div>
                  <dt className="text-sm text-zinc-500">Address</dt>
                  <dd className="text-zinc-300">
                    {provider.address}
                    {provider.city && `, ${provider.city}`}
                    {`, ${provider.state}`}
                    {provider.zip && ` ${provider.zip}`}
                  </dd>
                </div>
              )}
              {provider.email && (
                <div>
                  <dt className="text-sm text-zinc-500">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${provider.email}`}
                      className="text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      {provider.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Reviews
          {reviews.length > 0 && (
            <span className="text-zinc-500 text-lg font-normal ml-2">
              ({reviews.length})
            </span>
          )}
        </h2>
        <ReviewList reviews={reviews} />
      </section>

      {/* Review Form */}
      <section className="max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">
          Leave a Review
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <ReviewForm providerId={provider.id} />
        </div>
      </section>
    </div>
  );
}
