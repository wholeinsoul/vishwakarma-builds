import StarRating from './StarRating';
import type { Review } from '@/types';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-400">No reviews yet. Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white">{review.author_name}</span>
                {review.author_city && (
                  <span className="text-sm text-zinc-500">{review.author_city}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" />
                {review.service_type && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded capitalize">
                    {review.service_type}
                  </span>
                )}
              </div>
            </div>
            <time className="text-sm text-zinc-500" dateTime={review.created_at}>
              {new Date(review.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>

          {review.title && (
            <h4 className="font-medium text-white mb-1">{review.title}</h4>
          )}
          <p className="text-zinc-300 text-sm leading-relaxed">{review.body}</p>
        </div>
      ))}
    </div>
  );
}
