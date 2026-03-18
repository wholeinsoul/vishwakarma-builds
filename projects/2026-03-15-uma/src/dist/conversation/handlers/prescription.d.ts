import { ConversationState, ConversationContext } from '../states.js';
import { WhatsAppClient } from '../../services/whatsapp-client.js';
export interface HandlerResult {
    newState: ConversationState;
    newContext: ConversationContext;
}
export declare function handlePrescriptionImage(phone: string, imageUrl: string, context: ConversationContext, whatsapp: WhatsAppClient): Promise<HandlerResult>;
export declare function handleMedicationConfirmation(phone: string, messageText: string, context: ConversationContext, whatsapp: WhatsAppClient): Promise<HandlerResult>;
//# sourceMappingURL=prescription.d.ts.map