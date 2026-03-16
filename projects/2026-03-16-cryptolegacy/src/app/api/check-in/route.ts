export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkInSchema } from '@/lib/validations';

/**
 * POST /api/check-in
 * Record a check-in and reset the dead man's switch timer.
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { plan_id } = parsed.data;

    // Verify the plan belongs to the user and is active
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id, check_in_interval_days, status')
      .eq('id', plan_id)
      .eq('user_id', user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (plan.status !== 'active') {
      return NextResponse.json(
        { error: 'Plan is not active' },
        { status: 400 },
      );
    }

    // Insert check-in record
    const { error: checkInError } = await supabase.from('check_ins').insert({
      plan_id,
      user_id: user.id,
    });

    if (checkInError) {
      return NextResponse.json(
        { error: checkInError.message },
        { status: 500 },
      );
    }

    // Reset the next_check_in timer
    const next_check_in = new Date(
      Date.now() + plan.check_in_interval_days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { error: updateError } = await supabase
      .from('plans')
      .update({ next_check_in })
      .eq('id', plan_id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ next_check_in });
  } catch (err) {
    console.error('[POST /api/check-in]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/check-in?plan=<plan_id>
 * One-click check-in from an email link. Performs the same logic as POST
 * and then redirects to /check-in?success=true.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    const planId = request.nextUrl.searchParams.get('plan');

    if (!planId) {
      return NextResponse.redirect(
        new URL('/check-in?error=missing_plan', request.url),
      );
    }

    // Verify the plan belongs to the user and is active
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id, check_in_interval_days, status')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.redirect(
        new URL('/check-in?error=plan_not_found', request.url),
      );
    }

    if (plan.status !== 'active') {
      return NextResponse.redirect(
        new URL('/check-in?error=plan_not_active', request.url),
      );
    }

    // Insert check-in record
    await supabase.from('check_ins').insert({
      plan_id: planId,
      user_id: user.id,
    });

    // Reset the next_check_in timer
    const next_check_in = new Date(
      Date.now() + plan.check_in_interval_days * 24 * 60 * 60 * 1000,
    ).toISOString();

    await supabase
      .from('plans')
      .update({ next_check_in })
      .eq('id', planId);

    return NextResponse.redirect(
      new URL('/check-in?success=true', request.url),
    );
  } catch (err) {
    console.error('[GET /api/check-in]', err);
    return NextResponse.redirect(
      new URL('/check-in?error=server_error', request.url),
    );
  }
}
