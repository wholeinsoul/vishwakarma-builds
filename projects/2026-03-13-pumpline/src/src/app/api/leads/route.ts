import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { leadSchema } from '@/lib/validation';
import { hashIP, getClientIP } from '@/lib/ip-hash';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = leadSchema.safeParse(body);
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

    const { error: insertError } = await supabase.from('leads').insert({
      email: data.email,
      name: data.name,
      source: data.source,
      county_slug: data.county_slug,
      ip_hash,
    });

    // On duplicate email (unique constraint violation), silently return 200
    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { message: 'Thank you for signing up' },
          { status: 200 },
        );
      }
      console.error('Lead insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: 'Thank you for signing up' },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
