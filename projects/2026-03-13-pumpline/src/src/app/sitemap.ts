import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 21600; // 6 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pumpline.com';

  const { data: counties } = await supabase
    .from('counties')
    .select('slug, updated_at')
    .eq('is_active', true);

  const { data: providers } = await supabase
    .from('providers')
    .select('slug, updated_at')
    .eq('status', 'active');

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/checklist`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/for-providers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const countyPages: MetadataRoute.Sitemap = (counties || []).map((c) => ({
    url: `${baseUrl}/county/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const providerPages: MetadataRoute.Sitemap = (providers || []).map((p) => ({
    url: `${baseUrl}/provider/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...countyPages, ...providerPages];
}
