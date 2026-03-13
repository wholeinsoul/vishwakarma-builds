import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-white mb-4">
        Page Not Found
      </h2>
      <p className="text-zinc-400 mb-10">
        The page you are looking for does not exist or may have been moved. Try
        searching for a county or provider below.
      </p>

      <div className="flex justify-center mb-10">
        <SearchBar />
      </div>

      <div className="flex items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/checklist"
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
        >
          Free Checklist
        </Link>
      </div>
    </div>
  );
}
