import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock axios ───────────────────────────────────────────────────────────
const mockPost = vi.fn();
vi.mock('axios', () => ({
  default: {
    create: () => ({
      post: mockPost,
    }),
  },
  AxiosError: class AxiosError extends Error {
    response: unknown;
    constructor(message: string, response?: unknown) {
      super(message);
      this.name = 'AxiosError';
      this.response = response;
    }
  },
}));

// ─── Mock config ──────────────────────────────────────────────────────────
vi.mock('../src/config.js', () => ({
  config: {
    whatsapp: {
      accessToken: 'test-token',
      phoneNumberId: '12345',
      apiBaseUrl: 'https://graph.facebook.com/v21.0',
    },
  },
}));

import { MetaCloudClient, createWhatsAppClient } from '../src/services/whatsapp-client.js';

describe('WhatsApp Client', () => {
  let client: MetaCloudClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new MetaCloudClient('test-token', '12345');
  });

  // ─── sendText ─────────────────────────────────────────────────────────

  describe('sendText', () => {
    it('sends correct payload format', async () => {
      mockPost.mockResolvedValue({ data: { messages: [{ id: 'wamid.abc' }] } });

      await client.sendText('+919876543210', 'Hello, take your medicine!');

      expect(mockPost).toHaveBeenCalledWith('/12345/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '+919876543210',
        type: 'text',
        text: { preview_url: false, body: 'Hello, take your medicine!' },
      });
    });

    it('throws on API error', async () => {
      mockPost.mockRejectedValue(new Error('Network error'));

      await expect(client.sendText('+919876543210', 'Hello')).rejects.toThrow('Network error');
    });

    it('sends bilingual text correctly', async () => {
      mockPost.mockResolvedValue({ data: {} });

      const bilingualText = 'दवा का समय\nTime for medicine';
      await client.sendText('+919876543210', bilingualText);

      expect(mockPost).toHaveBeenCalledWith('/12345/messages', expect.objectContaining({
        text: { preview_url: false, body: bilingualText },
      }));
    });
  });

  // ─── sendImage ────────────────────────────────────────────────────────

  describe('sendImage', () => {
    it('sends image with caption', async () => {
      mockPost.mockResolvedValue({ data: {} });

      await client.sendImage('+919876543210', 'https://example.com/img.png', 'Your prescription');

      expect(mockPost).toHaveBeenCalledWith('/12345/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '+919876543210',
        type: 'image',
        image: { link: 'https://example.com/img.png', caption: 'Your prescription' },
      });
    });

    it('sends image without caption', async () => {
      mockPost.mockResolvedValue({ data: {} });

      await client.sendImage('+919876543210', 'https://example.com/img.png');

      expect(mockPost).toHaveBeenCalledWith('/12345/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '+919876543210',
        type: 'image',
        image: { link: 'https://example.com/img.png' },
      });
    });

    it('throws on API error', async () => {
      mockPost.mockRejectedValue(new Error('Upload failed'));

      await expect(
        client.sendImage('+919876543210', 'https://example.com/img.png'),
      ).rejects.toThrow('Upload failed');
    });
  });

  // ─── sendTemplate ─────────────────────────────────────────────────────

  describe('sendTemplate', () => {
    it('sends template with correct payload', async () => {
      mockPost.mockResolvedValue({ data: {} });

      await client.sendTemplate('+919876543210', 'medication_reminder', 'hi');

      expect(mockPost).toHaveBeenCalledWith('/12345/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '+919876543210',
        type: 'template',
        template: {
          name: 'medication_reminder',
          language: { code: 'hi' },
        },
      });
    });

    it('sends template with components', async () => {
      mockPost.mockResolvedValue({ data: {} });

      const components = [
        {
          type: 'body' as const,
          parameters: [{ type: 'text' as const, text: 'Metformin 500mg' }],
        },
      ];

      await client.sendTemplate('+919876543210', 'medication_reminder', 'hi', components);

      expect(mockPost).toHaveBeenCalledWith('/12345/messages', expect.objectContaining({
        template: {
          name: 'medication_reminder',
          language: { code: 'hi' },
          components,
        },
      }));
    });

    it('sends template without components when array is empty', async () => {
      mockPost.mockResolvedValue({ data: {} });

      await client.sendTemplate('+919876543210', 'welcome', 'en', []);

      expect(mockPost).toHaveBeenCalledWith('/12345/messages', expect.objectContaining({
        template: {
          name: 'welcome',
          language: { code: 'en' },
          // components should NOT be present
        },
      }));
    });
  });

  // ─── markAsRead ───────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('sends correct markAsRead payload', async () => {
      mockPost.mockResolvedValue({ data: {} });

      await client.markAsRead('wamid.abc123');

      expect(mockPost).toHaveBeenCalledWith('/12345/messages', {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: 'wamid.abc123',
      });
    });

    it('does not throw on API failure (non-critical)', async () => {
      mockPost.mockRejectedValue(new Error('Read receipt failed'));

      // markAsRead should swallow the error
      await expect(client.markAsRead('wamid.abc123')).resolves.toBeUndefined();
    });
  });

  // ─── Error logging ────────────────────────────────────────────────────

  describe('error logging', () => {
    it('logs Meta API error details', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const axiosError = Object.assign(new Error('Request failed'), {
        name: 'AxiosError',
        response: {
          status: 400,
          data: {
            error: {
              message: 'Invalid phone number',
              type: 'OAuthException',
              code: 100,
              error_subcode: 2018001,
              fbtrace_id: 'trace_123',
            },
          },
        },
      });
      // Make it look like an AxiosError
      Object.defineProperty(axiosError, 'constructor', { value: Error });

      mockPost.mockRejectedValue(axiosError);

      try {
        await client.sendText('+91invalid', 'test');
      } catch {
        // expected
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ─── Factory ──────────────────────────────────────────────────────────

  describe('createWhatsAppClient factory', () => {
    it('creates client with valid config', () => {
      const client = createWhatsAppClient();
      expect(client).toBeDefined();
    });

    it('throws when accessToken is missing', async () => {
      // Temporarily override config
      const { config } = await import('../src/config.js');
      const original = config.whatsapp.accessToken;
      (config.whatsapp as Record<string, string>).accessToken = '';

      expect(() => createWhatsAppClient()).toThrow('WHATSAPP_ACCESS_TOKEN is not set');

      (config.whatsapp as Record<string, string>).accessToken = original;
    });

    it('throws when phoneNumberId is missing', async () => {
      const { config } = await import('../src/config.js');
      const original = config.whatsapp.phoneNumberId;
      (config.whatsapp as Record<string, string>).phoneNumberId = '';

      expect(() => createWhatsAppClient()).toThrow('WHATSAPP_PHONE_NUMBER_ID is not set');

      (config.whatsapp as Record<string, string>).phoneNumberId = original;
    });
  });
});
