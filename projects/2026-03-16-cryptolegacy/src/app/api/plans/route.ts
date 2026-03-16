export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { planSchema } from '@/lib/validations';

/**
 * GET /api/plans
 * Retrieve all plans for the authenticated user, including beneficiary counts.
 */
export async function GET() {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch plans with a beneficiary count for each plan
    const { data: plans, error } = await supabase
      .from('plans')
      .select('*, beneficiaries(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten the beneficiary count into a top-level field
    const plansWithCount = (plans ?? []).map((plan) => ({
      ...plan,
      beneficiary_count: plan.beneficiaries?.[0]?.count ?? 0,
      beneficiaries: undefined,
    }));

    return NextResponse.json({ plans: plansWithCount });
  } catch (err) {
    console.error('[GET /api/plans]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/plans
 * Create a new encrypted recovery plan with beneficiaries.
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
    const parsed = planSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      title,
      encrypted_blob,
      encryption_iv,
      encryption_salt,
      check_in_interval_days,
      template_ids,
      beneficiaries,
    } = parsed.data;

    // Insert the plan with next_check_in calculated via SQL interval
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .insert({
        user_id: user.id,
        title,
        encrypted_blob,
        encryption_iv,
        encryption_salt,
        check_in_interval_days,
        template_ids,
        next_check_in: new Date(
          Date.now() + check_in_interval_days * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (planError) {
      return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    // Insert all beneficiaries linked to this plan
    const beneficiaryRows = beneficiaries.map((b) => ({
      plan_id: plan.id,
      user_id: user.id,
      name: b.name,
      email: b.email,
      phone: b.phone || null,
    }));

    const { error: benError } = await supabase
      .from('beneficiaries')
      .insert(beneficiaryRows);

    if (benError) {
      // Plan was created but beneficiaries failed; log and return partial error
      console.error('[POST /api/plans] beneficiary insert error:', benError);
      return NextResponse.json(
        { error: 'Plan created but failed to add beneficiaries', plan },
        { status: 500 },
      );
    }

    return NextResponse.json({ plan }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/plans]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
