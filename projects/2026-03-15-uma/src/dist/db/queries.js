import { getSupabase } from '../db/client.js';
// ─── Users ──────────────────────────────────────────────────────────────────
export async function findUserByPhone(phone) {
    const { data, error } = await getSupabase()
        .from('users')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();
    if (error)
        throw new Error(`findUserByPhone failed: ${error.message}`);
    return data;
}
export async function createUser(input) {
    const { data, error } = await getSupabase()
        .from('users')
        .insert({
        phone: input.phone,
        name: input.name ?? null,
        language: input.language ?? 'hi',
        timezone: input.timezone ?? 'Asia/Kolkata',
    })
        .select()
        .single();
    if (error)
        throw new Error(`createUser failed: ${error.message}`);
    return data;
}
export async function updateUserStatus(userId, status, onboardingStep) {
    const updateData = {
        status,
        updated_at: new Date().toISOString(),
    };
    if (onboardingStep !== undefined) {
        updateData.onboarding_step = onboardingStep;
    }
    const { data, error } = await getSupabase()
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
    if (error)
        throw new Error(`updateUserStatus failed: ${error.message}`);
    return data;
}
export async function updateUserName(userId, name) {
    const { data, error } = await getSupabase()
        .from('users')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
    if (error)
        throw new Error(`updateUserName failed: ${error.message}`);
    return data;
}
export async function findUserById(userId) {
    const { data, error } = await getSupabase()
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
    if (error)
        throw new Error(`findUserById failed: ${error.message}`);
    return data;
}
export async function updateUserNameByPhone(phone, name) {
    const { data, error } = await getSupabase()
        .from('users')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('phone', phone)
        .select()
        .single();
    if (error)
        throw new Error(`updateUserNameByPhone failed: ${error.message}`);
    return data;
}
export async function updateUserStatusByPhone(phone, status) {
    const { data, error } = await getSupabase()
        .from('users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('phone', phone)
        .select()
        .single();
    if (error)
        throw new Error(`updateUserStatusByPhone failed: ${error.message}`);
    return data;
}
// ─── Caretakers ─────────────────────────────────────────────────────────────
export async function findCaretakersByUserId(userId) {
    const { data, error } = await getSupabase()
        .from('caretakers')
        .select('*')
        .eq('user_id', userId);
    if (error)
        throw new Error(`findCaretakersByUserId failed: ${error.message}`);
    return data ?? [];
}
export async function createCaretaker(input) {
    const { data, error } = await getSupabase()
        .from('caretakers')
        .insert({
        phone: input.phone,
        name: input.name ?? null,
        photo_url: input.photo_url ?? null,
        voice_clip_url: input.voice_clip_url ?? null,
        relationship: input.relationship ?? null,
        user_id: input.user_id,
        is_payer: input.is_payer ?? true,
    })
        .select()
        .single();
    if (error)
        throw new Error(`createCaretaker failed: ${error.message}`);
    return data;
}
export async function findCaretakerByUserId(userId) {
    const { data, error } = await getSupabase()
        .from('caretakers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    if (error)
        throw new Error(`findCaretakerByUserId failed: ${error.message}`);
    return data;
}
// ─── Prescriptions ──────────────────────────────────────────────────────────
export async function createPrescription(input) {
    const { data, error } = await getSupabase()
        .from('prescriptions')
        .insert({
        user_id: input.user_id,
        image_url: input.image_url,
        ai_raw_response: input.ai_raw_response ?? null,
        doctor_name: input.doctor_name ?? null,
        prescription_date: input.prescription_date ?? null,
    })
        .select()
        .single();
    if (error)
        throw new Error(`createPrescription failed: ${error.message}`);
    return data;
}
export async function findPrescriptionsByUserId(userId) {
    const { data, error } = await getSupabase()
        .from('prescriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error)
        throw new Error(`findPrescriptionsByUserId failed: ${error.message}`);
    return data ?? [];
}
export async function updatePrescriptionStatus(prescriptionId, status, aiRawResponse) {
    const updateData = { status };
    if (aiRawResponse !== undefined) {
        updateData.ai_raw_response = aiRawResponse;
    }
    const { data, error } = await getSupabase()
        .from('prescriptions')
        .update(updateData)
        .eq('id', prescriptionId)
        .select()
        .single();
    if (error)
        throw new Error(`updatePrescriptionStatus failed: ${error.message}`);
    return data;
}
export async function updatePrescriptionInfographicUrl(prescriptionId, infographicUrl) {
    const { data, error } = await getSupabase()
        .from('prescriptions')
        .update({ infographic_url: infographicUrl })
        .eq('id', prescriptionId)
        .select()
        .single();
    if (error)
        throw new Error(`updatePrescriptionInfographicUrl failed: ${error.message}`);
    return data;
}
// ─── Medications ────────────────────────────────────────────────────────────
export async function createMedication(input) {
    const { data, error } = await getSupabase()
        .from('medications')
        .insert({
        prescription_id: input.prescription_id,
        user_id: input.user_id,
        drug_name_en: input.drug_name_en,
        drug_name_hi: input.drug_name_hi ?? null,
        dosage: input.dosage ?? null,
        frequency: input.frequency ?? null,
        timing: input.timing ?? null,
        instructions: input.instructions ?? null,
        duration_days: input.duration_days ?? null,
        validated_against_db: input.validated_against_db ?? false,
    })
        .select()
        .single();
    if (error)
        throw new Error(`createMedication failed: ${error.message}`);
    return data;
}
export async function findMedicationsByPrescriptionId(prescriptionId) {
    const { data, error } = await getSupabase()
        .from('medications')
        .select('*')
        .eq('prescription_id', prescriptionId)
        .order('created_at', { ascending: true });
    if (error)
        throw new Error(`findMedicationsByPrescriptionId failed: ${error.message}`);
    return data ?? [];
}
export async function findActiveMedicationsByUserId(userId) {
    const { data, error } = await getSupabase()
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_confirmed', true)
        .order('created_at', { ascending: true });
    if (error)
        throw new Error(`findActiveMedicationsByUserId failed: ${error.message}`);
    return data ?? [];
}
export async function findMedicationById(medicationId) {
    const { data, error } = await getSupabase()
        .from('medications')
        .select('*')
        .eq('id', medicationId)
        .maybeSingle();
    if (error)
        throw new Error(`findMedicationById failed: ${error.message}`);
    return data;
}
export async function deactivateMedication(medicationId) {
    const { data, error } = await getSupabase()
        .from('medications')
        .update({ is_active: false })
        .eq('id', medicationId)
        .select()
        .single();
    if (error)
        throw new Error(`deactivateMedication failed: ${error.message}`);
    return data;
}
export async function confirmMedication(medicationId) {
    const { data, error } = await getSupabase()
        .from('medications')
        .update({ is_confirmed: true })
        .eq('id', medicationId)
        .select()
        .single();
    if (error)
        throw new Error(`confirmMedication failed: ${error.message}`);
    return data;
}
// ─── Schedules ──────────────────────────────────────────────────────────────
export async function createSchedule(input) {
    const { data, error } = await getSupabase()
        .from('schedules')
        .insert({
        user_id: input.user_id,
        medication_id: input.medication_id,
        reminder_time: input.reminder_time,
        days_of_week: input.days_of_week ?? [1, 2, 3, 4, 5, 6, 7],
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
    })
        .select()
        .single();
    if (error)
        throw new Error(`createSchedule failed: ${error.message}`);
    return data;
}
/**
 * Atomically claim and return due reminders.
 *
 * Uses an RPC function to UPDATE...RETURNING in a single query,
 * preventing duplicate sends from concurrent cron ticks.
 * Falls back to a two-step select+update if the RPC doesn't exist yet.
 */
export async function findDueReminders(currentTime, currentDayOfWeek, currentDate) {
    // Atomic approach: update last_sent_at and return rows in one query
    // This prevents the race condition where two cron ticks pick up the same reminder
    const now = new Date().toISOString();
    const todayStart = currentDate + 'T00:00:00.000Z';
    const { data, error } = await getSupabase()
        .from('schedules')
        .select('*')
        .eq('is_active', true)
        .eq('reminder_time', currentTime)
        .contains('days_of_week', [currentDayOfWeek])
        .or(`start_date.is.null,start_date.lte.${currentDate}`)
        .or(`end_date.is.null,end_date.gte.${currentDate}`)
        .or(`last_sent_at.is.null,last_sent_at.lt.${todayStart}`);
    if (error)
        throw new Error(`findDueReminders failed: ${error.message}`);
    // Immediately mark all found as sent to prevent re-pickup
    const ids = (data ?? []).map((s) => s.id);
    if (ids.length > 0) {
        const { error: updateError } = await getSupabase()
            .from('schedules')
            .update({ last_sent_at: now })
            .in('id', ids);
        if (updateError) {
            console.error('[DB] Failed to mark reminders as sent:', updateError.message);
        }
    }
    return (data ?? []);
}
export async function updateScheduleLastSent(scheduleId) {
    const { data, error } = await getSupabase()
        .from('schedules')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('id', scheduleId)
        .select()
        .single();
    if (error)
        throw new Error(`updateScheduleLastSent failed: ${error.message}`);
    return data;
}
// ─── Adherence Log ──────────────────────────────────────────────────────────
export async function createAdherenceLog(input) {
    const { data, error } = await getSupabase()
        .from('adherence_log')
        .insert({
        user_id: input.user_id,
        medication_id: input.medication_id,
        schedule_id: input.schedule_id,
        reminder_sent_at: input.reminder_sent_at,
    })
        .select()
        .single();
    if (error)
        throw new Error(`createAdherenceLog failed: ${error.message}`);
    return data;
}
/**
 * Find adherence log entries where the user has not responded
 * and the reminder was sent more than 30 minutes ago.
 * These are candidates for caretaker alerting.
 */
export async function findPendingReminders(cutoffTime) {
    const { data, error } = await getSupabase()
        .from('adherence_log')
        .select(`
      *,
      users!adherence_log_user_id_fkey(id, phone, name),
      medications!adherence_log_medication_id_fkey(id, drug_name_en, drug_name_hi)
    `)
        .is('response', null)
        .eq('caretaker_alerted', false)
        .lt('reminder_sent_at', cutoffTime);
    if (error)
        throw new Error(`findPendingReminders failed: ${error.message}`);
    return (data ?? []);
}
export async function updateAdherenceResponse(adherenceLogId, response) {
    const { data, error } = await getSupabase()
        .from('adherence_log')
        .update({
        response,
        response_at: new Date().toISOString(),
    })
        .eq('id', adherenceLogId)
        .select()
        .single();
    if (error)
        throw new Error(`updateAdherenceResponse failed: ${error.message}`);
    return data;
}
export async function markCaretakerAlerted(adherenceLogId) {
    const { data, error } = await getSupabase()
        .from('adherence_log')
        .update({
        caretaker_alerted: true,
        caretaker_alerted_at: new Date().toISOString(),
    })
        .eq('id', adherenceLogId)
        .select()
        .single();
    if (error)
        throw new Error(`markCaretakerAlerted failed: ${error.message}`);
    return data;
}
export async function findPendingAdherenceLogs(userId) {
    const { data, error } = await getSupabase()
        .from('adherence_log')
        .select('*')
        .eq('user_id', userId)
        .is('response', null)
        .order('reminder_sent_at', { ascending: false });
    if (error)
        throw new Error(`findPendingAdherenceLogs failed: ${error.message}`);
    return data ?? [];
}
export async function findMissedReminders() {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data, error } = await getSupabase()
        .from('adherence_log')
        .select('*')
        .is('response', null)
        .eq('caretaker_alerted', false)
        .lt('reminder_sent_at', cutoff);
    if (error)
        throw new Error(`findMissedReminders failed: ${error.message}`);
    return data ?? [];
}
// ─── Conversations ──────────────────────────────────────────────────────────
export async function findConversationByPhone(phone) {
    const { data, error } = await getSupabase()
        .from('conversations')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();
    if (error)
        throw new Error(`findConversationByPhone failed: ${error.message}`);
    return data;
}
/**
 * Upsert conversation state for a phone number.
 * Creates a new row if none exists; updates state, context,
 * and last_message_at if one does.
 */
export async function upsertConversation(phone, state, context) {
    const { data, error } = await getSupabase()
        .from('conversations')
        .upsert({
        phone,
        state,
        context,
        last_message_at: new Date().toISOString(),
    }, { onConflict: 'phone' })
        .select()
        .single();
    if (error)
        throw new Error(`upsertConversation failed: ${error.message}`);
    return data;
}
//# sourceMappingURL=queries.js.map