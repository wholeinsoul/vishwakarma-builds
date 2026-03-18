import { WhatsAppClient } from '../services/whatsapp-client.js';
export interface IncomingMessage {
    phone: string;
    messageId: string;
    type: 'text' | 'image' | 'interactive' | 'button' | 'unknown';
    text?: string;
    imageUrl?: string;
}
export declare function handleMessage(message: IncomingMessage, whatsapp: WhatsAppClient): Promise<void>;
//# sourceMappingURL=engine.d.ts.map