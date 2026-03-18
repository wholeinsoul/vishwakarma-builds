import axios, { AxiosError } from 'axios';
import { config } from '../config.js';
// ---------------------------------------------------------------------------
// MetaCloudClient — concrete implementation using Meta Cloud API v21.0
// ---------------------------------------------------------------------------
export class MetaCloudClient {
    accessToken;
    phoneNumberId;
    client;
    messagesUrl;
    constructor(accessToken, phoneNumberId, baseUrl = 'https://graph.facebook.com/v21.0') {
        this.accessToken = accessToken;
        this.phoneNumberId = phoneNumberId;
        this.messagesUrl = `${baseUrl}/${phoneNumberId}/messages`;
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30_000,
        });
    }
    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------
    async sendText(to, text) {
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { preview_url: false, body: text },
        };
        await this.send(payload);
    }
    async sendImage(to, imageUrl, caption) {
        const image = { link: imageUrl };
        if (caption) {
            image.caption = caption;
        }
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'image',
            image,
        };
        await this.send(payload);
    }
    async sendTemplate(to, templateName, languageCode, components) {
        const template = {
            name: templateName,
            language: { code: languageCode },
        };
        if (components && components.length > 0) {
            template.components = components;
        }
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'template',
            template,
        };
        await this.send(payload);
    }
    async markAsRead(messageId) {
        const payload = {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        };
        try {
            await this.client.post(`/${this.phoneNumberId}/messages`, payload);
        }
        catch (error) {
            // Mark-as-read failures are non-critical — log but don't throw.
            this.logError('markAsRead', error);
        }
    }
    // -----------------------------------------------------------------------
    // Internals
    // -----------------------------------------------------------------------
    /** POST a message payload and handle errors uniformly. */
    async send(payload) {
        try {
            await this.client.post(`/${this.phoneNumberId}/messages`, payload);
        }
        catch (error) {
            this.logError('send', error);
            throw error;
        }
    }
    /** Extract useful info from Axios / Meta API errors and log to stderr. */
    logError(method, error) {
        if (error instanceof AxiosError) {
            const data = error.response?.data;
            const meta = data?.error;
            console.error(`[WhatsAppClient.${method}] Meta API error — ` +
                `status=${error.response?.status ?? 'N/A'} ` +
                `code=${meta?.code ?? 'N/A'} ` +
                `subcode=${meta?.error_subcode ?? 'N/A'} ` +
                `type=${meta?.type ?? 'N/A'} ` +
                `message=${meta?.message ?? error.message} ` +
                `fbtrace=${meta?.fbtrace_id ?? 'N/A'}`);
        }
        else if (error instanceof Error) {
            console.error(`[WhatsAppClient.${method}] Unexpected error — ${error.message}`);
        }
        else {
            console.error(`[WhatsAppClient.${method}] Unknown error — ${String(error)}`);
        }
    }
}
// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------
/**
 * Create a `WhatsAppClient` using the app-wide configuration.
 *
 * Call this once at startup (or lazily) and inject the returned instance into
 * handlers / services that need to send WhatsApp messages.
 */
export function createWhatsAppClient() {
    const { accessToken, phoneNumberId, apiBaseUrl } = config.whatsapp;
    if (!accessToken) {
        throw new Error('WHATSAPP_ACCESS_TOKEN is not set — cannot create WhatsApp client');
    }
    if (!phoneNumberId) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID is not set — cannot create WhatsApp client');
    }
    return new MetaCloudClient(accessToken, phoneNumberId, apiBaseUrl);
}
//# sourceMappingURL=whatsapp-client.js.map