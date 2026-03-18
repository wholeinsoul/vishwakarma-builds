import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config.js';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

/** A single parameter within a template component. */
export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  /** Used when type is "text". */
  text?: string;
  /** Used when type is "image". */
  image?: { link: string };
  /** Used when type is "document". */
  document?: { link: string; filename?: string };
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
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

/** Shape of a Meta Cloud API error body. */
interface MetaApiErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

// ---------------------------------------------------------------------------
// WhatsAppClient interface
// ---------------------------------------------------------------------------

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
  sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components?: TemplateComponent[],
  ): Promise<void>;

  /** Mark an inbound message as "read" (blue ticks). */
  markAsRead(messageId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// MetaCloudClient — concrete implementation using Meta Cloud API v21.0
// ---------------------------------------------------------------------------

export class MetaCloudClient implements WhatsAppClient {
  private readonly client: AxiosInstance;
  private readonly messagesUrl: string;

  constructor(
    private readonly accessToken: string,
    private readonly phoneNumberId: string,
    baseUrl = 'https://graph.facebook.com/v21.0',
  ) {
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

  async sendText(to: string, text: string): Promise<void> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: text },
    };

    await this.send(payload);
  }

  async sendImage(
    to: string,
    imageUrl: string,
    caption?: string,
  ): Promise<void> {
    const image: Record<string, string> = { link: imageUrl };
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

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components?: TemplateComponent[],
  ): Promise<void> {
    const template: Record<string, unknown> = {
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

  async markAsRead(messageId: string): Promise<void> {
    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    try {
      await this.client.post(`/${this.phoneNumberId}/messages`, payload);
    } catch (error) {
      // Mark-as-read failures are non-critical — log but don't throw.
      this.logError('markAsRead', error);
    }
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  /** POST a message payload and handle errors uniformly. */
  private async send(payload: Record<string, unknown>): Promise<void> {
    try {
      await this.client.post(`/${this.phoneNumberId}/messages`, payload);
    } catch (error) {
      this.logError('send', error);
      throw error;
    }
  }

  /** Extract useful info from Axios / Meta API errors and log to stderr. */
  private logError(method: string, error: unknown): void {
    if (error instanceof AxiosError) {
      const data = error.response?.data as MetaApiErrorBody | undefined;
      const meta = data?.error;

      console.error(
        `[WhatsAppClient.${method}] Meta API error — ` +
          `status=${error.response?.status ?? 'N/A'} ` +
          `code=${meta?.code ?? 'N/A'} ` +
          `subcode=${meta?.error_subcode ?? 'N/A'} ` +
          `type=${meta?.type ?? 'N/A'} ` +
          `message=${meta?.message ?? error.message} ` +
          `fbtrace=${meta?.fbtrace_id ?? 'N/A'}`,
      );
    } else if (error instanceof Error) {
      console.error(
        `[WhatsAppClient.${method}] Unexpected error — ${error.message}`,
      );
    } else {
      console.error(
        `[WhatsAppClient.${method}] Unknown error — ${String(error)}`,
      );
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
export function createWhatsAppClient(): WhatsAppClient {
  const { accessToken, phoneNumberId, apiBaseUrl } = config.whatsapp;

  if (!accessToken) {
    throw new Error(
      'WHATSAPP_ACCESS_TOKEN is not set — cannot create WhatsApp client',
    );
  }
  if (!phoneNumberId) {
    throw new Error(
      'WHATSAPP_PHONE_NUMBER_ID is not set — cannot create WhatsApp client',
    );
  }

  return new MetaCloudClient(accessToken, phoneNumberId, apiBaseUrl);
}
