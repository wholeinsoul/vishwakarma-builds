'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalProviders: number;
  pendingReviews: number;
  totalLeads: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProviders: 0,
    pendingReviews: 0,
    totalLeads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [providersRes, reviewsRes, leadsRes] = await Promise.all([
        supabase
          .from('providers')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalProviders: providersRes.count ?? 0,
        pendingReviews: reviewsRes.count ?? 0,
        totalLeads: leadsRes.count ?? 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const cards = [
    {
      label: 'Total Providers',
      value: stats.totalProviders,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'Pending Reviews',
      value: stats.pendingReviews,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          Loading stats...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`${card.bgColor} border ${card.borderColor} rounded-lg p-5`}
            >
              <p className="text-sm text-zinc-400 mb-1">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
