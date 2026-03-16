export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET /api/decrypt?token=<uuid>
 * Public endpoint (no auth required). Returns the encrypted blob and
 * metadata for a beneficiary to decrypt locally with their passphrase.
 * The notify_token acts as the authentication mechanism.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 },
      );
    }

    // Find the beneficiary by their unique notify_token
    const { data: beneficiary, error: benError } = await supabaseAdmin
      .from('beneficiaries')
      .select('id, plan_id')
      .eq('notify_token', token)
      .single();

    if (benError || !beneficiary) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 },
      );
    }

    // Fetch the associated plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('id, title, encrypted_blob, encryption_iv, encryption_salt, status')
      .eq('id', beneficiary.plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 },
      );
    }

    // Only allow access if the plan has been triggered
    if (plan.status !== 'triggered') {
      return NextResponse.json(
        { error: 'This plan has not been triggered yet' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      encrypted_blob: plan.encrypted_blob,
      encryption_iv: plan.encryption_iv,
      encryption_salt: plan.encryption_salt,
      plan_title: plan.title,
    });
  } catch (err) {
    console.error('[GET /api/decrypt]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
