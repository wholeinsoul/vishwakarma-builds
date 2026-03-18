/** A single parameter within a template component. */
export interface TemplateParameter {
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
    /** Used when type is "text". */
    text?: string;
    /** Used when type is "image". */
    image?: {
        link: string;
    };
    /** Used when type is "document". */
    document?: {
        link: string;
        filename?: string;
    };
}
/** A component block sent inside a template message. */
export interface TemplateComponent {
    type: 'header' | 'body' | 'button';
    /** Required when type is "button". */
    sub_type?: 'quick_reply' | 'url';
    /** Button index (0-based). Required when type is "button". */
    index?: number;
    parameters: TemplateParameter[];
}
/** Shape of a successful Meta Cloud API send response. */
export interface MetaSendResponse {
    messaging_product: 'whatsapp';
    contacts: Array<{
        input: string;
        wa_id: string;
    }>;
    messages: Array<{
        id: string;
    }>;
}
/**
 * Abstract contract for sending WhatsApp messages.
 * This allows swapping the Meta Cloud API implementation for a test double or
 * an alternative BSP in the future without changing business logic.
 */
export interface WhatsAppClient {
    /** Send a plain-text message. */
    sendText(to: string, text: string): Promise<void>;
    /** Send an image (by public URL) with an optional caption. */
    sendImage(to: string, imageUrl: string, caption?: string): Promise<void>;
    /**
     * Send a pre-approved template message.
     * Business-initiated conversations (e.g. reminders) MUST use templates.
     */
    sendTemplate(to: string, templateName: string, languageCode: string, components?: TemplateComponent[]): Promise<void>;
    /** Mark an inbound message as "read" (blue ticks). */
    markAsRead(messageId: string): Promise<void>;
}
export declare class MetaCloudClient implements WhatsAppClient {
    private readonly accessToken;
    private readonly phoneNumberId;
    private readonly client;
    private readonly messagesUrl;
    constructor(accessToken: string, phoneNumberId: string, baseUrl?: string);
    sendText(to: string, text: string): Promise<void>;
    sendImage(to: string, imageUrl: string, caption?: string): Promise<void>;
    sendTemplate(to: string, templateName: string, languageCode: string, components?: TemplateComponent[]): Promise<void>;
    markAsRead(messageId: string): Promise<void>;
    /** POST a message payload and handle errors uniformly. */
    private send;
    /** Extract useful info from Axios / Meta API errors and log to stderr. */
    private logError;
}
/**
 * Create a `WhatsAppClient` using the app-wide configuration.
 *
 * Call this once at startup (or lazily) and inject the returned instance into
 * handlers / services that need to send WhatsApp messages.
 */
export declare function createWhatsAppClient(): WhatsAppClient;
//# sourceMappingURL=whatsapp-client.d.ts.map