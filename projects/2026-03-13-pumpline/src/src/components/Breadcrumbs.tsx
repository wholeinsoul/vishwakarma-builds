import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbJsonLd, getBaseUrl } from '@/lib/seo';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = getBaseUrl();
  const jsonLdItems = items.map((item) => ({
    name: item.label,
    url: item.href ? `${baseUrl}${item.href}` : baseUrl,
  }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(jsonLdItems)} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-zinc-400">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-zinc-600">/</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-orange-500 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-300">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
