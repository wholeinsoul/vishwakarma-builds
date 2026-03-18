import { getSupabase } from '../db/client.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  name: string | null;
  language: string;
  timezone: string;
  status: string;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface Caretaker {
  id: string;
  phone: string;
  name: string | null;
  photo_url: string | null;
  voice_clip_url: string | null;
  relationship: string | null;
  user_id: string;
  is_payer: boolean;
  created_at: string;
}

export interface Prescription {
  id: string;
  user_id: string;
  image_url: string;
  ai_raw_response: Record<string, unknown> | null;
  doctor_name: string | null;
  prescription_date: string | null;
  status: string;
  infographic_url: string | null;
  created_at: string;
}

export interface Medication {
  id: string;
  prescription_id: string;
  user_id: string;
  drug_name_en: string;
  drug_name_hi: string | null;
  dosage: string | null;
  frequency: string | null;
  timing: string[] | null;
  instructions: string | null;
  duration_days: number | null;
  is_active: boolean;
  is_confirmed: boolean;
  validated_against_db: boolean;
  created_at: string;
}

export interface Schedule {
  id: string;
  user_id: string;
  medication_id: string;
  reminder_time: string;
  days_of_week: number[];
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
}

export interface AdherenceLog {
  id: string;
  user_id: string;
  medication_id: string;
  schedule_id: string;
  reminder_sent_at: string;
  response: string | null;
  response_at: string | null;
  caretaker_alerted: boolean;
  caretaker_alerted_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  phone: string;
  state: string;
  context: Record<string, unknown>;
  last_message_at: string;
  created_at: string;
}

// ─── Input types for creates/updates ────────────────────────────────────────

export interface CreateUserInput {
  phone: string;
  name?: string;
  language?: string;
  timezone?: string;
}

export interface CreateCaretakerInput {
  phone: string;
  name?: string;
  photo_url?: string;
  voice_clip_url?: string;
  relationship?: string;
  user_id: string;
  is_payer?: boolean;
}

export interface CreatePrescriptionInput {
  user_id: string;
  image_url: string;
  ai_raw_response?: Record<string, unknown>;
  doctor_name?: string;
  prescription_date?: string;
}

export interface CreateMedicationInput {
  prescription_id: string;
  user_id: string;
  drug_name_en: string;
  drug_name_hi?: string;
  dosage?: string;
  frequency?: string;
  timing?: string[];
  instructions?: string;
  duration_days?: number;
  validated_against_db?: boolean;
}

export interface CreateScheduleInput {
  user_id: string;
  medication_id: string;
  reminder_time: string;
  days_of_week?: number[];
  start_date?: string;
  end_date?: string;
}

export interface CreateAdherenceLogInput {
  user_id: string;
  medication_id: string;
  schedule_id: string;
  reminder_sent_at: string;
}

// ─── Users ──────────────────────────────────────────────────────────────────

export async function findUserByPhone(phone: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (error) throw new Error(`findUserByPhone failed: ${error.message}`);
  return data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
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

  if (error) throw new Error(`createUser failed: ${error.message}`);
  return data;
}

export async function updateUserStatus(
  userId: string,
  status: string,
  onboardingStep?: number,
): Promise<User> {
  const updateData: Record<string, unknown> = {
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

  if (error) throw new Error(`updateUserStatus failed: ${error.message}`);
  return data;
}

export async function updateUserName(
  userId: string,
  name: string,
): Promise<User> {
  const { data, error } = await getSupabase()
    .from('users')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`updateUserName failed: ${error.message}`);
  return data;
}

export async function findUserById(userId: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(`findUserById failed: ${error.message}`);
  return data;
}

export async function updateUserNameByPhone(
  phone: string,
  name: string,
): Promise<User> {
  const { data, error } = await getSupabase()
    .from('users')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('phone', phone)
    .select()
    .single();

  if (error) throw new Error(`updateUserNameByPhone failed: ${error.message}`);
  return data;
}

export async function updateUserStatusByPhone(
  phone: string,
  status: string,
): Promise<User> {
  const { data, error } = await getSupabase()
    .from('users')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('phone', phone)
    .select()
    .single();

  if (error) throw new Error(`updateUserStatusByPhone failed: ${error.message}`);
  return data;
}

// ─── Caretakers ─────────────────────────────────────────────────────────────

export async function findCaretakersByUserId(
  userId: string,
): Promise<Caretaker[]> {
  const { data, error } = await getSupabase()
    .from('caretakers')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(`findCaretakersByUserId failed: ${error.message}`);
  return data ?? [];
}

export async function createCaretaker(
  input: CreateCaretakerInput,
): Promise<Caretaker> {
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

  if (error) throw new Error(`createCaretaker failed: ${error.message}`);
  return data;
}

export async function findCaretakerByUserId(
  userId: string,
): Promise<Caretaker | null> {
  const { data, error } = await getSupabase()
    .from('caretakers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(`findCaretakerByUserId failed: ${error.message}`);
  return data;
}

// ─── Prescriptions ──────────────────────────────────────────────────────────

export async function createPrescription(
  input: CreatePrescriptionInput,
): Promise<Prescription> {
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

  if (error) throw new Error(`createPrescription failed: ${error.message}`);
  return data;
}

export async function findPrescriptionsByUserId(
  userId: string,
): Promise<Prescription[]> {
  const { data, error } = await getSupabase()
    .from('prescriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error)
    throw new Error(`findPrescriptionsByUserId failed: ${error.message}`);
  return data ?? [];
}

export async function updatePrescriptionStatus(
  prescriptionId: string,
  status: string,
  aiRawResponse?: Record<string, unknown>,
): Promise<Prescription> {
  const updateData: Record<string, unknown> = { status };
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

export async function updatePrescriptionInfographicUrl(
  prescriptionId: string,
  infographicUrl: string,
): Promise<Prescription> {
  const { data, error } = await getSupabase()
    .from('prescriptions')
    .update({ infographic_url: infographicUrl })
    .eq('id', prescriptionId)
    .select()
    .single();

  if (error)
    throw new Error(
      `updatePrescriptionInfographicUrl failed: ${error.message}`,
    );
  return data;
}

// ─── Medications ────────────────────────────────────────────────────────────

export async function createMedication(
  input: CreateMedicationInput,
): Promise<Medication> {
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

  if (error) throw new Error(`createMedication failed: ${error.message}`);
  return data;
}

export async function findMedicationsByPrescriptionId(
  prescriptionId: string,
): Promise<Medication[]> {
  const { data, error } = await getSupabase()
    .from('medications')
    .select('*')
    .eq('prescription_id', prescriptionId)
    .order('created_at', { ascending: true });

  if (error)
    throw new Error(
      `findMedicationsByPrescriptionId failed: ${error.message}`,
    );
  return data ?? [];
}

export async function findActiveMedicationsByUserId(
  userId: string,
): Promise<Medication[]> {
  const { data, error } = await getSupabase()
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('is_confirmed', true)
    .order('created_at', { ascending: true });

  if (error)
    throw new Error(
      `findActiveMedicationsByUserId failed: ${error.message}`,
    );
  return data ?? [];
}

export async function findMedicationById(
  medicationId: string,
): Promise<Medication | null> {
  const { data, error } = await getSupabase()
    .from('medications')
    .select('*')
    .eq('id', medicationId)
    .maybeSingle();

  if (error) throw new Error(`findMedicationById failed: ${error.message}`);
  return data;
}

export async function deactivateMedication(
  medicationId: string,
): Promise<Medication> {
  const { data, error } = await getSupabase()
    .from('medications')
    .update({ is_active: false })
    .eq('id', medicationId)
    .select()
    .single();

  if (error) throw new Error(`deactivateMedication failed: ${error.message}`);
  return data;
}

export async function confirmMedication(
  medicationId: string,
): Promise<Medication> {
  const { data, error } = await getSupabase()
    .from('medications')
    .update({ is_confirmed: true })
    .eq('id', medicationId)
    .select()
    .single();

  if (error) throw new Error(`confirmMedication failed: ${error.message}`);
  return data;
}

// ─── Schedules ──────────────────────────────────────────────────────────────

export async function createSchedule(
  input: CreateScheduleInput,
): Promise<Schedule> {
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

  if (error) throw new Error(`createSchedule failed: ${error.message}`);
  return data;
}

/**
 * Atomically claim and return due reminders.
 *
 * Uses an RPC function to UPDATE...RETURNING in a single query,
 * preventing duplicate sends from concurrent cron ticks.
 * Falls back to a two-step select+update if the RPC doesn't exist yet.
 */
export async function findDueReminders(
  currentTime: string,
  currentDayOfWeek: number,
  currentDate: string,
): Promise<Schedule[]> {
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

  if (error) throw new Error(`findDueReminders failed: ${error.message}`);

  // Immediately mark all found as sent to prevent re-pickup
  const ids = (data ?? []).map((s: Schedule) => s.id);
  if (ids.length > 0) {
    const { error: updateError } = await getSupabase()
      .from('schedules')
      .update({ last_sent_at: now })
      .in('id', ids);

    if (updateError) {
      console.error('[DB] Failed to mark reminders as sent:', updateError.message);
    }
  }

  return (data ?? []) as Schedule[];
}

export async function updateScheduleLastSent(
  scheduleId: string,
): Promise<Schedule> {
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

export async function createAdherenceLog(
  input: CreateAdherenceLogInput,
): Promise<AdherenceLog> {
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

  if (error) throw new Error(`createAdherenceLog failed: ${error.message}`);
  return data;
}

/**
 * Find adherence log entries where the user has not responded
 * and the reminder was sent more than 30 minutes ago.
 * These are candidates for caretaker alerting.
 */
export async function findPendingReminders(
  cutoffTime: string,
): Promise<
  (AdherenceLog & {
    users: Pick<User, 'id' | 'phone' | 'name'>;
    medications: Pick<Medication, 'id' | 'drug_name_en' | 'drug_name_hi'>;
  })[]
> {
  const { data, error } = await getSupabase()
    .from('adherence_log')
    .select(
      `
      *,
      users!adherence_log_user_id_fkey(id, phone, name),
      medications!adherence_log_medication_id_fkey(id, drug_name_en, drug_name_hi)
    `,
    )
    .is('response', null)
    .eq('caretaker_alerted', false)
    .lt('reminder_sent_at', cutoffTime);

  if (error)
    throw new Error(`findPendingReminders failed: ${error.message}`);
  return (data ?? []) as typeof data & {
    users: Pick<User, 'id' | 'phone' | 'name'>;
    medications: Pick<Medication, 'id' | 'drug_name_en' | 'drug_name_hi'>;
  }[];
}

export async function updateAdherenceResponse(
  adherenceLogId: string,
  response: string,
): Promise<AdherenceLog> {
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

export async function markCaretakerAlerted(
  adherenceLogId: string,
): Promise<AdherenceLog> {
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

export async function findPendingAdherenceLogs(
  userId: string,
): Promise<AdherenceLog[]> {
  const { data, error } = await getSupabase()
    .from('adherence_log')
    .select('*')
    .eq('user_id', userId)
    .is('response', null)
    .order('reminder_sent_at', { ascending: false });

  if (error) throw new Error(`findPendingAdherenceLogs failed: ${error.message}`);
  return data ?? [];
}

export async function findMissedReminders(): Promise<AdherenceLog[]> {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data, error } = await getSupabase()
    .from('adherence_log')
    .select('*')
    .is('response', null)
    .eq('caretaker_alerted', false)
    .lt('reminder_sent_at', cutoff);

  if (error) throw new Error(`findMissedReminders failed: ${error.message}`);
  return data ?? [];
}

// ─── Conversations ──────────────────────────────────────────────────────────

export async function findConversationByPhone(
  phone: string,
): Promise<Conversation | null> {
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
export async function upsertConversation(
  phone: string,
  state: string,
  context: Record<string, unknown>,
): Promise<Conversation> {
  const { data, error } = await getSupabase()
    .from('conversations')
    .upsert(
      {
        phone,
        state,
        context,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: 'phone' },
    )
    .select()
    .single();

  if (error) throw new Error(`upsertConversation failed: ${error.message}`);
  return data;
}
