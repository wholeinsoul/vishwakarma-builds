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
export declare function findUserByPhone(phone: string): Promise<User | null>;
export declare function createUser(input: CreateUserInput): Promise<User>;
export declare function updateUserStatus(userId: string, status: string, onboardingStep?: number): Promise<User>;
export declare function updateUserName(userId: string, name: string): Promise<User>;
export declare function findUserById(userId: string): Promise<User | null>;
export declare function updateUserNameByPhone(phone: string, name: string): Promise<User>;
export declare function updateUserStatusByPhone(phone: string, status: string): Promise<User>;
export declare function findCaretakersByUserId(userId: string): Promise<Caretaker[]>;
export declare function createCaretaker(input: CreateCaretakerInput): Promise<Caretaker>;
export declare function findCaretakerByUserId(userId: string): Promise<Caretaker | null>;
export declare function createPrescription(input: CreatePrescriptionInput): Promise<Prescription>;
export declare function findPrescriptionsByUserId(userId: string): Promise<Prescription[]>;
export declare function updatePrescriptionStatus(prescriptionId: string, status: string, aiRawResponse?: Record<string, unknown>): Promise<Prescription>;
export declare function updatePrescriptionInfographicUrl(prescriptionId: string, infographicUrl: string): Promise<Prescription>;
export declare function createMedication(input: CreateMedicationInput): Promise<Medication>;
export declare function findMedicationsByPrescriptionId(prescriptionId: string): Promise<Medication[]>;
export declare function findActiveMedicationsByUserId(userId: string): Promise<Medication[]>;
export declare function findMedicationById(medicationId: string): Promise<Medication | null>;
export declare function deactivateMedication(medicationId: string): Promise<Medication>;
export declare function confirmMedication(medicationId: string): Promise<Medication>;
export declare function createSchedule(input: CreateScheduleInput): Promise<Schedule>;
/**
 * Atomically claim and return due reminders.
 *
 * Uses an RPC function to UPDATE...RETURNING in a single query,
 * preventing duplicate sends from concurrent cron ticks.
 * Falls back to a two-step select+update if the RPC doesn't exist yet.
 */
export declare function findDueReminders(currentTime: string, currentDayOfWeek: number, currentDate: string): Promise<Schedule[]>;
export declare function updateScheduleLastSent(scheduleId: string): Promise<Schedule>;
export declare function createAdherenceLog(input: CreateAdherenceLogInput): Promise<AdherenceLog>;
/**
 * Find adherence log entries where the user has not responded
 * and the reminder was sent more than 30 minutes ago.
 * These are candidates for caretaker alerting.
 */
export declare function findPendingReminders(cutoffTime: string): Promise<(AdherenceLog & {
    users: Pick<User, 'id' | 'phone' | 'name'>;
    medications: Pick<Medication, 'id' | 'drug_name_en' | 'drug_name_hi'>;
})[]>;
export declare function updateAdherenceResponse(adherenceLogId: string, response: string): Promise<AdherenceLog>;
export declare function markCaretakerAlerted(adherenceLogId: string): Promise<AdherenceLog>;
export declare function findPendingAdherenceLogs(userId: string): Promise<AdherenceLog[]>;
export declare function findMissedReminders(): Promise<AdherenceLog[]>;
export declare function findConversationByPhone(phone: string): Promise<Conversation | null>;
/**
 * Upsert conversation state for a phone number.
 * Creates a new row if none exists; updates state, context,
 * and last_message_at if one does.
 */
export declare function upsertConversation(phone: string, state: string, context: Record<string, unknown>): Promise<Conversation>;
//# sourceMappingURL=queries.d.ts.map