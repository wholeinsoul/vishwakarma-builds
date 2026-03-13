'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';

type ReviewWithProvider = Review & {
  provider: { name: string } | null;
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchReviews() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, provider:providers(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data as ReviewWithProvider[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function handleAction(reviewId: string, status: 'approved' | 'rejected') {
    setActionLoading(reviewId);
    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', reviewId);

    if (!error) {
      await fetchReviews();
    }
    setActionLoading(null);
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-orange-400' : 'text-zinc-700'}
      >
        ★
      </span>
    ));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Review Moderation</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <p className="text-zinc-400">No pending reviews to moderate.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {review.author_name}
                    </span>
                    {review.author_city && (
                      <span className="text-xs text-zinc-500">
                        {review.author_city}
                      </span>
                    )}
                    <span className="text-xs text-zinc-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{renderStars(review.rating)}</span>
                    {review.provider && (
                      <span className="text-xs text-zinc-500">
                        for{' '}
                        <span className="text-orange-400">
                          {review.provider.name}
                        </span>
                      </span>
                    )}
                  </div>

                  {review.title && (
                    <p className="text-sm font-medium text-white mb-1">
                      {review.title}
                    </p>
                  )}
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {review.body}
                  </p>

                  {review.service_type && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Service: {review.service_type}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(review.id, 'approved')}
                    disabled={actionLoading === review.id}
                    className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-500 text-white rounded transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(review.id, 'rejected')}
                    disabled={actionLoading === review.id}
                    className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
