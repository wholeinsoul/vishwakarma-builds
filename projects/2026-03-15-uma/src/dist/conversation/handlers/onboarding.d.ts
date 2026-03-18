import { ConversationState, ConversationContext } from '../states.js';
import { WhatsAppClient } from '../../services/whatsapp-client.js';
export interface HandlerResult {
    newState: ConversationState;
    newContext: ConversationContext;
}
export declare function handleOnboardingWelcome(phone: string, _messageText: string, _context: ConversationContext, whatsapp: WhatsAppClient): Promise<HandlerResult>;
export declare function handleOnboardingName(phone: string, messageText: string, context: ConversationContext, whatsapp: WhatsAppClient): Promise<HandlerResult>;
export declare function handleOnboardingCaretaker(phone: string, messageText: string, context: ConversationContext, whatsapp: WhatsAppClient): Promise<HandlerResult>;
export declare function handleCaretakerName(phone: string, messageText: string, context: ConversationContext, whatsapp: WhatsAppClient): Promise<HandlerResult>;
//# sourceMappingURL=onboarding.d.ts.map