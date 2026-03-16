export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { beneficiarySchema } from '@/lib/validations';
import { z } from 'zod';

const addBeneficiarySchema = beneficiarySchema.extend({
  plan_id: z.string().uuid('plan_id must be a valid UUID'),
});

/**
 * POST /api/beneficiaries
 * Add a beneficiary to an existing plan.
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
    const parsed = addBeneficiarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { plan_id, name, email, phone } = parsed.data;

    // Verify the plan belongs to the authenticated user
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('id', plan_id)
      .eq('user_id', user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Insert the beneficiary
    const { data: beneficiary, error: insertError } = await supabase
      .from('beneficiaries')
      .insert({
        plan_id,
        user_id: user.id,
        name,
        email,
        phone: phone || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ beneficiary }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/beneficiaries]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
