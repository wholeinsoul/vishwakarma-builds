export var ConversationState;
(function (ConversationState) {
    ConversationState["IDLE"] = "idle";
    ConversationState["ONBOARDING_WELCOME"] = "onboarding_welcome";
    ConversationState["ONBOARDING_NAME"] = "onboarding_name";
    ConversationState["ONBOARDING_CARETAKER"] = "onboarding_caretaker";
    ConversationState["ONBOARDING_CARETAKER_NAME"] = "onboarding_caretaker_name";
    ConversationState["AWAITING_PRESCRIPTION"] = "awaiting_prescription";
    ConversationState["PROCESSING_PRESCRIPTION"] = "processing_prescription";
    ConversationState["CONFIRMING_MEDICATIONS"] = "confirming_medications";
    ConversationState["AWAITING_REMINDER_RESPONSE"] = "awaiting_reminder_response";
})(ConversationState || (ConversationState = {}));
export const VALID_TRANSITIONS = [
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
export function isValidTransition(from, to) {
    return VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);
}
//# sourceMappingURL=states.js.map