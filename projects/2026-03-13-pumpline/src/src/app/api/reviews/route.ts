import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { reviewSchema } from '@/lib/validation';
import { hashIP, getClientIP } from '@/lib/ip-hash';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: String(i.path[0] ?? 'form'),
        message: i.message,
      }));
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 },
      );
    }

    const data = result.data;
    const ip = getClientIP(request);
    const ip_hash = hashIP(ip);

    const supabase = getServiceSupabase();

    // Verify provider exists and is active
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('id', data.provider_id)
      .eq('status', 'active')
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 },
      );
    }

    // Insert review with pending status
    const { error: insertError } = await supabase.from('reviews').insert({
      provider_id: data.provider_id,
      author_name: data.author_name,
      author_city: data.author_city,
      rating: data.rating,
      title: data.title,
      body: data.body,
      service_type: data.service_type,
      service_date: data.service_date,
      status: 'pending',
      ip_hash,
    });

    if (insertError) {
      console.error('Review insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: 'Review submitted and pending moderation' },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
