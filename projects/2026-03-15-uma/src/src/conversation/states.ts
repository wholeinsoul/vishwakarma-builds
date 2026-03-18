export enum ConversationState {
  IDLE = 'idle',
  ONBOARDING_WELCOME = 'onboarding_welcome',
  ONBOARDING_NAME = 'onboarding_name',
  ONBOARDING_CARETAKER = 'onboarding_caretaker',
  ONBOARDING_CARETAKER_NAME = 'onboarding_caretaker_name',
  AWAITING_PRESCRIPTION = 'awaiting_prescription',
  PROCESSING_PRESCRIPTION = 'processing_prescription',
  CONFIRMING_MEDICATIONS = 'confirming_medications',
  AWAITING_REMINDER_RESPONSE = 'awaiting_reminder_response',
}

export interface ConversationContext {
  prescription_id?: string;
  medications_to_confirm?: string[];
  current_confirm_index?: number;
  caretaker_phone?: string;
  [key: string]: unknown;
}

export interface StateTransition {
  from: ConversationState;
  to: ConversationState;
  trigger: string;
}

export const VALID_TRANSITIONS: StateTransition[] = [
  // Onboarding flow
  { from: ConversationState.IDLE, to: ConversationState.ONBOARDING_WELCOME, trigger: 'start' },
  { from: ConversationState.ONBOARDING_WELCOME, to: ConversationState.ONBOARDING_NAME, trigger: 'any' },
  { from: ConversationState.ONBOARDING_NAME, to: ConversationState.ONBOARDING_CARETAKER, trigger: 'name_provided' },
  { from: ConversationState.ONBOARDING_CARETAKER, to: ConversationState.ONBOARDING_CARETAKER_NAME, trigger: 'yes' },
  { from: ConversationState.ONBOARDING_CARETAKER, to: ConversationState.AWAITING_PRESCRIPTION, trigger: 'no' },
  { from: ConversationState.ONBOARDING_CARETAKER_NAME, to: ConversationState.AWAITING_PRESCRIPTION, trigger: 'caretaker_added' },

  // Prescription flow
  { from: ConversationState.AWAITING_PRESCRIPTION, to: ConversationState.PROCESSING_PRESCRIPTION, trigger: 'image_received' },
  { from: ConversationState.PROCESSING_PRESCRIPTION, to: ConversationState.CONFIRMING_MEDICATIONS, trigger: 'parsed' },
  { from: ConversationState.PROCESSING_PRESCRIPTION, to: ConversationState.AWAITING_PRESCRIPTION, trigger: 'error' },

  // Confirmation flow
  { from: ConversationState.CONFIRMING_MEDICATIONS, to: ConversationState.CONFIRMING_MEDICATIONS, trigger: 'next_med' },
  { from: ConversationState.CONFIRMING_MEDICATIONS, to: ConversationState.AWAITING_PRESCRIPTION, trigger: 'all_confirmed' },

  // Reminder response
  { from: ConversationState.AWAITING_REMINDER_RESPONSE, to: ConversationState.AWAITING_PRESCRIPTION, trigger: 'response_recorded' },

  // Re-scan from active state
  { from: ConversationState.AWAITING_PRESCRIPTION, to: ConversationState.PROCESSING_PRESCRIPTION, trigger: 'image_received' },
];

export function isValidTransition(from: ConversationState, to: ConversationState): boolean {
  return VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);
}
