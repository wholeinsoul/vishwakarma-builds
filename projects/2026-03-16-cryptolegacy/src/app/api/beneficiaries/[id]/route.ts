export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/beneficiaries/[id]
 * Remove a beneficiary. The authenticated user must own the beneficiary.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify the beneficiary belongs to the authenticated user
    const { data: beneficiary, error: fetchError } = await supabase
      .from('beneficiaries')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !beneficiary) {
      return NextResponse.json(
        { error: 'Beneficiary not found' },
        { status: 404 },
      );
    }

    // Delete the beneficiary
    const { error: deleteError } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/beneficiaries/[id]]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
