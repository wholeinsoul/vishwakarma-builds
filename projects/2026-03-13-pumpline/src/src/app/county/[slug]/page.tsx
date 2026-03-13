import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import ProviderCard from '@/components/ProviderCard';
import EmailCapture from '@/components/EmailCapture';
import { supabase } from '@/lib/supabase';
import { countyPageJsonLd, getBaseUrl } from '@/lib/seo';
import type { County, Provider } from '@/types';

export const revalidate = 1800;

interface PageProps {
  params: { slug: string };
}

async function getCountyBySlug(slug: string): Promise<County | null> {
  const { data } = await supabase
    .from('counties')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data as County | null;
}

async function getProvidersByCounty(countyId: string): Promise<Provider[]> {
  const { data } = await supabase
    .from('providers')
    .select('*')
    .eq('county_id', countyId)
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .order('avg_rating', { ascending: false });
  return (data as Provider[]) || [];
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('counties')
    .select('slug')
    .eq('is_active', true);
  return (data || []).map((county) => ({ slug: county.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const county = await getCountyBySlug(params.slug);
  if (!county) return {};

  const title = county.meta_title || `Septic Services in ${county.name}, ${county.state_full}`;
  const description =
    county.meta_desc ||
    `Find and compare septic service providers in ${county.name}, ${county.state_full}. Read reviews, compare pricing, and connect with trusted local professionals.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${getBaseUrl()}/county/${county.slug}`,
    },
  };
}

export default async function CountyPage({ params }: PageProps) {
  const county = await getCountyBySlug(params.slug);
  if (!county) notFound();

  const providers = await getProvidersByCounty(county.id);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: county.state_full, href: `/#${county.state.toLowerCase()}` },
    { label: county.name },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      <JsonLd data={countyPageJsonLd(county, providers)} />

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Septic Services in{' '}
          <span className="text-orange-500">{county.name}</span>
          {', '}
          {county.state_full}
        </h1>
        {county.description && (
          <p className="text-zinc-400 text-lg max-w-3xl">{county.description}</p>
        )}
        {county.septic_pct && (
          <p className="text-sm text-zinc-500 mt-2">
            Approximately {county.septic_pct}% of homes in {county.name} use
            septic systems.
          </p>
        )}
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          {providers.length > 0
            ? `${providers.length} Septic Provider${providers.length !== 1 ? 's' : ''} in ${county.name}`
            : `No Providers Found in ${county.name}`}
        </h2>

        {providers.length > 0 ? (
          <div className="space-y-4">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-400 mb-2">
              We don&apos;t have any providers listed in {county.name} yet.
            </p>
            <p className="text-sm text-zinc-500">
              Are you a septic service provider in this area?{' '}
              <a
                href="/for-providers"
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                List your business for free.
              </a>
            </p>
          </div>
        )}
      </section>

      <section className="mt-16 max-w-lg mx-auto">
        <EmailCapture
          source="county"
          countySlug={county.slug}
          title="Get Septic Maintenance Tips"
          description={`Download our free checklist to keep your septic system in ${county.name} running smoothly.`}
        />
      </section>
    </div>
  );
}
