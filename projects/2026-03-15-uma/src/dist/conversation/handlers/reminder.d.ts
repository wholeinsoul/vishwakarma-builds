import { ConversationState, ConversationContext } from '../states.js';
import { WhatsAppClient } from '../../services/whatsapp-client.js';
export interface HandlerResult {
    newState: ConversationState;
    newContext: ConversationContext;
}
export declare function handleReminderResponse(phone: string, messageText: string, context: ConversationContext, _whatsapp: WhatsAppClient): Promise<HandlerResult>;
//# sourceMappingURL=reminder.d.ts.map