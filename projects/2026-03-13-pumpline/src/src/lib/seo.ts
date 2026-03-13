import type { Provider, County, Review } from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pumpline.com';

export function getBaseUrl(): string {
  return SITE_URL;
}

export function localBusinessJsonLd(provider: Provider, county: County, reviews: Review[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/provider/${provider.slug}`,
    name: provider.name,
    description: provider.description,
    telephone: provider.phone,
    email: provider.email,
    url: provider.website || `${SITE_URL}/provider/${provider.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: provider.address,
      addressLocality: provider.city,
      addressRegion: provider.state,
      postalCode: provider.zip,
    },
    areaServed: provider.service_area,
    ...(provider.review_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: provider.avg_rating,
        reviewCount: provider.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author_name },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: r.body,
        datePublished: r.created_at,
      })),
    }),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function countyPageJsonLd(county: County, providers: Provider[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Septic Services in ${county.name}, ${county.state}`,
    description: county.description,
    numberOfItems: providers.length,
    itemListElement: providers.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: p.name,
        url: `${SITE_URL}/provider/${p.slug}`,
        telephone: p.phone,
        ...(p.review_count > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.avg_rating,
            reviewCount: p.review_count,
          },
        }),
      },
    })),
  };
}
