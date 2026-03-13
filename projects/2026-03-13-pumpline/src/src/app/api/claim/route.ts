import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { claimSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = claimSchema.safeParse(body);
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
    const supabase = getServiceSupabase();

    // Atomic claim: update only if not already claimed (prevents TOCTOU race)
    const { data: updated, error: updateError } = await supabase
      .from('providers')
      .update({
        is_claimed: true,
        claim_email: data.email,
      })
      .eq('id', data.provider_id)
      .eq('is_claimed', false)
      .select('id')
      .single();

    if (updateError?.code === 'PGRST116' || !updated) {
      // No rows matched — either provider doesn't exist or already claimed
      const { data: existing } = await supabase
        .from('providers')
        .select('id, is_claimed')
        .eq('id', data.provider_id)
        .single();

      if (!existing) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: 'This provider listing has already been claimed' },
        { status: 409 },
      );
    }

    if (updateError) {
      console.error('Claim update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to process claim' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: 'Provider claimed successfully' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
