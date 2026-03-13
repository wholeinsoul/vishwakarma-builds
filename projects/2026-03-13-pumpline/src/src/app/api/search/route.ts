import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let q = searchParams.get('q')?.trim() ?? '';

    // Truncate query to 200 characters
    q = q.slice(0, 200);

    let query = supabase
      .from('counties')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (q) {
      query = query.ilike('name', `%${q}%`);
    }

    const { data: counties, error } = await query;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 },
      );
    }

    return NextResponse.json({ counties: counties ?? [] });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
