import { ConversationState } from './states.js';
import * as db from '../db/queries.js';
import { handleOnboardingWelcome, handleOnboardingName, handleOnboardingCaretaker, handleCaretakerName, } from './handlers/onboarding.js';
import { handlePrescriptionImage, handleMedicationConfirmation, } from './handlers/prescription.js';
import { handleReminderResponse } from './handlers/reminder.js';
import { messages } from '../utils/hindi.js';
export async function handleMessage(message, whatsapp) {
    const { phone } = message;
    // Mark message as read
    await whatsapp.markAsRead(message.messageId);
    // Get or create conversation state
    let conversation = await db.findConversationByPhone(phone);
    if (!conversation) {
        // New user — create user and start onboarding
        await db.createUser({ phone });
        await db.upsertConversation(phone, ConversationState.IDLE, {});
        conversation = await db.findConversationByPhone(phone);
    }
    const currentState = (conversation?.state || ConversationState.IDLE);
    const context = (conversation?.context || {});
    const text = message.text || '';
    let result;
    try {
        switch (currentState) {
            case ConversationState.IDLE:
                result = await handleOnboardingWelcome(phone, text, context, whatsapp);
                break;
            case ConversationState.ONBOARDING_WELCOME:
                result = await handleOnboardingWelcome(phone, text, context, whatsapp);
                break;
            case ConversationState.ONBOARDING_NAME:
                result = await handleOnboardingName(phone, text, context, whatsapp);
                break;
            case ConversationState.ONBOARDING_CARETAKER:
                result = await handleOnboardingCaretaker(phone, text, context, whatsapp);
                break;
            case ConversationState.ONBOARDING_CARETAKER_NAME:
                result = await handleCaretakerName(phone, text, context, whatsapp);
                break;
            case ConversationState.AWAITING_PRESCRIPTION:
                if (message.type === 'image' && message.imageUrl) {
                    result = await handlePrescriptionImage(phone, message.imageUrl, context, whatsapp);
                }
                else {
                    await whatsapp.sendText(phone, messages.askPrescription);
                    result = { newState: ConversationState.AWAITING_PRESCRIPTION, newContext: context };
                }
                break;
            case ConversationState.PROCESSING_PRESCRIPTION:
                // Still processing — ask to wait
                await whatsapp.sendText(phone, messages.processingPrescription);
                result = { newState: ConversationState.PROCESSING_PRESCRIPTION, newContext: context };
                break;
            case ConversationState.CONFIRMING_MEDICATIONS:
                result = await handleMedicationConfirmation(phone, text, context, whatsapp);
                break;
            case ConversationState.AWAITING_REMINDER_RESPONSE:
                result = await handleReminderResponse(phone, text, context, whatsapp);
                break;
            default:
                await whatsapp.sendText(phone, messages.invalidInput);
                result = { newState: ConversationState.AWAITING_PRESCRIPTION, newContext: {} };
                break;
        }
        // Persist new state
        await db.upsertConversation(phone, result.newState, result.newContext);
    }
    catch (err) {
        console.error(`[Engine] Error handling message from ${phone}:`, err);
        await whatsapp.sendText(phone, messages.invalidInput);
    }
}
//# sourceMappingURL=engine.js.map