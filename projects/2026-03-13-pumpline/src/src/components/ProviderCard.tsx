import Link from 'next/link';
import StarRating from './StarRating';
import type { Provider } from '@/types';

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className={`bg-zinc-900 border rounded-lg p-6 hover:border-orange-500/50 transition-colors ${provider.is_premium ? 'border-orange-500/30 ring-1 ring-orange-500/10' : 'border-zinc-800'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/provider/${provider.slug}`}
              className="text-lg font-semibold text-white hover:text-orange-500 transition-colors truncate"
            >
              {provider.name}
            </Link>
            {provider.is_premium && (
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                Premium
              </span>
            )}
            {provider.is_verified && (
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={provider.avg_rating} size="sm" />
            <span className="text-sm text-zinc-400">
              {provider.avg_rating > 0 ? provider.avg_rating.toFixed(1) : 'No ratings'}
              {provider.review_count > 0 && ` (${provider.review_count} review${provider.review_count !== 1 ? 's' : ''})`}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {provider.services.map((service) => (
              <span
                key={service}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300 capitalize"
              >
                {service}
              </span>
            ))}
          </div>

          {provider.pricing_range && (
            <p className="text-sm text-zinc-400 mb-1">
              <span className="text-zinc-500">Pricing:</span> {provider.pricing_range}
            </p>
          )}

          {provider.response_time && (
            <p className="text-sm text-zinc-400">
              <span className="text-zinc-500">Response:</span> {provider.response_time}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          {provider.phone ? (
            <a
              href={`tel:${provider.phone.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              {provider.phone}
            </a>
          ) : provider.website ? (
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Visit Website
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
