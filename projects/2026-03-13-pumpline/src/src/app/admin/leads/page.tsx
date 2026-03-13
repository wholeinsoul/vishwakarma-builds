'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/types';

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLeads(data as Lead[]);
      }
      setLoading(false);
    }

    fetchLeads();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Leads</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          Loading leads...
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <p className="text-zinc-400">No leads collected yet.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    County
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="p-3 text-white font-medium">{lead.email}</td>
                    <td className="p-3 text-zinc-300">{lead.name ?? '—'}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {lead.source}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-400">
                      {lead.county_slug ?? '—'}
                    </td>
                    <td className="p-3 text-zinc-500">
                      {new Date(lead.created_at).toLocaleDateString()}
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
