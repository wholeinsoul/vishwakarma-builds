'use client';

import { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  providerId: string;
}

export default function ReviewForm({ providerId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [authorCity, setAuthorCity] = useState('');
  const [body, setBody] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!rating || rating < 1) newErrors.rating = 'Please select a rating';
    if (!authorName.trim() || authorName.trim().length < 2) newErrors.authorName = 'Name must be at least 2 characters';
    if (!body.trim() || body.trim().length < 20) newErrors.body = 'Review must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: providerId,
          author_name: authorName.trim(),
          author_city: authorCity.trim() || undefined,
          rating,
          body: body.trim(),
          service_type: serviceType || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const err of data.errors) {
            fieldErrors[err.field || 'form'] = err.message;
          }
          setErrors(fieldErrors);
        } else {
          setErrors({ form: data.error || 'Something went wrong. Please try again.' });
        }
        return;
      }

      setSuccess(true);
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-400 mb-2">Thank you for your review!</h3>
        <p className="text-zinc-400">Your review will appear after moderation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Rating <span className="text-red-400">*</span>
        </label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
        {errors.rating && <p className="mt-1 text-sm text-red-400">{errors.rating}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-zinc-300 mb-1">
            Your Name <span className="text-red-400">*</span>
          </label>
          <input
            id="authorName"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={50}
            placeholder="e.g. Sarah M."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          {errors.authorName && <p className="mt-1 text-sm text-red-400">{errors.authorName}</p>}
        </div>

        <div>
          <label htmlFor="authorCity" className="block text-sm font-medium text-zinc-300 mb-1">
            City (optional)
          </label>
          <input
            id="authorCity"
            type="text"
            value={authorCity}
            onChange={(e) => setAuthorCity(e.target.value)}
            maxLength={100}
            placeholder="e.g. Austin, TX"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="serviceType" className="block text-sm font-medium text-zinc-300 mb-1">
          Service Type (optional)
        </label>
        <select
          id="serviceType"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
        >
          <option value="">Select a service</option>
          <option value="pumping">Pumping</option>
          <option value="repair">Repair</option>
          <option value="installation">Installation</option>
          <option value="inspection">Inspection</option>
        </select>
      </div>

      <div>
        <label htmlFor="reviewBody" className="block text-sm font-medium text-zinc-300 mb-1">
          Your Review <span className="text-red-400">*</span>
        </label>
        <textarea
          id="reviewBody"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Share your experience with this provider (minimum 20 characters)..."
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-y"
        />
        <div className="flex justify-between mt-1">
          {errors.body ? (
            <p className="text-sm text-red-400">{errors.body}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-zinc-500">{body.length}/2000</span>
        </div>
      </div>

      {errors.form && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-sm text-red-400">{errors.form}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
