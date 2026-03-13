'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Provider } from '@/types';

type ProviderWithCounty = Provider & {
  county: { name: string } | null;
};

export default function AdminProviders() {
  const [providers, setProviders] = useState<ProviderWithCounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  async function fetchProviders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('providers')
      .select('*, county:counties(name)')
      .order('name', { ascending: true });

    if (!error && data) {
      setProviders(data as ProviderWithCounty[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProviders();
  }, []);

  async function toggleVerified(providerId: string, currentValue: boolean) {
    setToggleLoading(providerId);
    const { error } = await supabase
      .from('providers')
      .update({ is_verified: !currentValue })
      .eq('id', providerId);

    if (!error) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId ? { ...p, is_verified: !currentValue } : p
        )
      );
    }
    setToggleLoading(null);
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      active: 'bg-green-500/10 text-green-400 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${
          colors[status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'
        }`}
      >
        {status}
      </span>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Providers</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          Loading providers...
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <p className="text-zinc-400">No providers found.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    County
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="text-center p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Premium
                  </th>
                  <th className="text-center p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="text-center p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {providers.map((provider) => (
                  <tr
                    key={provider.id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="p-3 text-white font-medium">
                      {provider.name}
                    </td>
                    <td className="p-3 text-zinc-400">
                      {provider.county?.name ?? '—'}
                    </td>
                    <td className="p-3">{statusBadge(provider.status)}</td>
                    <td className="p-3 text-center">
                      {provider.is_verified ? (
                        <span className="text-green-400">Yes</span>
                      ) : (
                        <span className="text-zinc-600">No</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {provider.is_premium ? (
                        <span className="text-orange-400">Yes</span>
                      ) : (
                        <span className="text-zinc-600">No</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-zinc-300">
                      {provider.avg_rating > 0
                        ? `${provider.avg_rating.toFixed(1)} (${provider.review_count})`
                        : '—'}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          toggleVerified(provider.id, provider.is_verified)
                        }
                        disabled={toggleLoading === provider.id}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                          provider.is_verified
                            ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                            : 'bg-orange-600 text-white hover:bg-orange-500'
                        }`}
                      >
                        {provider.is_verified ? 'Unverify' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
