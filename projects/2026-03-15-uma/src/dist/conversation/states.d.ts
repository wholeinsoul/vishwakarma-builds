export declare enum ConversationState {
    IDLE = "idle",
    ONBOARDING_WELCOME = "onboarding_welcome",
    ONBOARDING_NAME = "onboarding_name",
    ONBOARDING_CARETAKER = "onboarding_caretaker",
    ONBOARDING_CARETAKER_NAME = "onboarding_caretaker_name",
    AWAITING_PRESCRIPTION = "awaiting_prescription",
    PROCESSING_PRESCRIPTION = "processing_prescription",
    CONFIRMING_MEDICATIONS = "confirming_medications",
    AWAITING_REMINDER_RESPONSE = "awaiting_reminder_response"
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
export declare const VALID_TRANSITIONS: StateTransition[];
export declare function isValidTransition(from: ConversationState, to: ConversationState): boolean;
//# sourceMappingURL=states.d.ts.map