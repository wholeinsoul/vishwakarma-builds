'use client';

import { useState } from 'react';

interface EmailCaptureProps {
  source?: string;
  countySlug?: string;
  title?: string;
  description?: string;
}

export default function EmailCapture({
  source = 'checklist',
  countySlug,
  title = 'Get Your Free Septic Maintenance Checklist',
  description = 'Download our comprehensive checklist to keep your septic system running smoothly for years.',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source,
          county_slug: countySlug || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-400 mb-2">Check your email!</h3>
        <p className="text-zinc-400">Your Septic Maintenance Checklist is on its way.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-zinc-400 text-sm mb-4">{description}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
        />
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {submitting ? '...' : 'Get Checklist'}
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <p className="text-xs text-zinc-500">No spam. Unsubscribe anytime.</p>
      </form>
    </div>
  );
}
