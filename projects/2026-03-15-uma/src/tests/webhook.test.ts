import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import crypto from 'crypto';

// Mock config
vi.mock('../src/config.js', () => ({
  config: {
    nodeEnv: 'production',
    whatsapp: {
      verifyToken: 'test-verify-token',
      accessToken: 'test-access-token',
      appSecret: 'test-app-secret',
      phoneNumberId: '123456',
      apiBaseUrl: 'https://graph.facebook.com/v21.0',
    },
  },
}));

// Mock conversation engine
const mockHandleMessage = vi.fn();
vi.mock('../src/conversation/engine.js', () => ({
  handleMessage: (...args: unknown[]) => mockHandleMessage(...args),
}));

// Mock whatsapp client
const mockWhatsAppClient = {
  sendText: vi.fn().mockResolvedValue(undefined),
  sendImage: vi.fn().mockResolvedValue(undefined),
  sendTemplate: vi.fn().mockResolvedValue(undefined),
  markAsRead: vi.fn().mockResolvedValue(undefined),
};
vi.mock('../src/services/whatsapp-client.js', () => ({
  createWhatsAppClient: () => mockWhatsAppClient,
}));

// Mock axios for getImageUrl
const mockAxiosGet = vi.fn();
vi.mock('axios', () => ({
  default: { get: (...args: unknown[]) => mockAxiosGet(...args) },
}));

import { registerWebhookRoutes } from '../src/webhook/whatsapp.js';

function makeSignature(body: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${hmac}`;
}

function makeWebhookBody(messages: unknown[] = [], statuses?: unknown[]) {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'entry1',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '15551234567', phone_number_id: '123456' },
              contacts: [{ profile: { name: 'Test User' }, wa_id: '919876543210' }],
              messages,
              ...(statuses ? { statuses } : {}),
            },
            field: 'messages',
          },
        ],
      },
    ],
  };
}

describe('WhatsApp Webhook', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await registerWebhookRoutes(app, mockWhatsAppClient);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── GET verification endpoint ──────────────────────────────────────────

  describe('GET /webhook/whatsapp — verification', () => {
    it('returns challenge on valid verification request', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/webhook/whatsapp',
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'test-verify-token',
          'hub.challenge': 'challenge_abc123',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('challenge_abc123');
    });

    it('returns 403 with wrong verify token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/webhook/whatsapp',
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong-token',
          'hub.challenge': 'challenge_abc123',
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('returns 403 with wrong mode', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/webhook/whatsapp',
        query: {
          'hub.mode': 'unsubscribe',
          'hub.verify_token': 'test-verify-token',
          'hub.challenge': 'challenge_abc123',
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('returns 403 when query params are missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/webhook/whatsapp',
      });

      expect(response.statusCode).toBe(403);
    });
  });

  // ─── POST signature verification ────────────────────────────────────────

  describe('POST /webhook/whatsapp — signature verification', () => {
    it('accepts valid signature in production mode', async () => {
      const body = JSON.stringify(makeWebhookBody([]));
      const sig = makeSignature(body, 'test-app-secret');

      const response = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        headers: {
          'content-type': 'application/json',
          'x-hub-signature-256': sig,
        },
        payload: body,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('EVENT_RECEIVED');
    });

    it('rejects invalid signature in production mode', async () => {
      const body = JSON.stringify(makeWebhookBody([]));
      // Use a valid-length hex string (64 chars) so timingSafeEqual doesn't throw on length mismatch
      const wrongSig = 'sha256=' + '0'.repeat(64);

      const response = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        headers: {
          'content-type': 'application/json',
          'x-hub-signature-256': wrongSig,
        },
        payload: body,
      });

      expect(response.statusCode).toBe(401);
    });

    it('rejects missing signature in production mode', async () => {
      const body = JSON.stringify(makeWebhookBody([]));

      const response = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        headers: { 'content-type': 'application/json' },
        payload: body,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ─── Message routing ────────────────────────────────────────────────────

  describe('POST /webhook/whatsapp — message routing', () => {
    // Helper: inject a valid signed request
    async function injectSigned(body: unknown) {
      const bodyStr = JSON.stringify(body);
      const sig = makeSignature(bodyStr, 'test-app-secret');
      return app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        headers: {
          'content-type': 'application/json',
          'x-hub-signature-256': sig,
        },
        payload: bodyStr,
      });
    }

    it('routes text messages with correct payload', async () => {
      const body = makeWebhookBody([
        { from: '919876543210', id: 'msg1', timestamp: '1710000000', type: 'text', text: { body: 'Hello' } },
      ]);

      await injectSigned(body);
      // Allow async processing
      await new Promise((r) => setTimeout(r, 50));

      expect(mockHandleMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '919876543210',
          messageId: 'msg1',
          type: 'text',
          text: 'Hello',
        }),
        mockWhatsAppClient,
      );
    });

    it('routes image messages after fetching image URL', async () => {
      mockAxiosGet.mockResolvedValue({ data: { url: 'https://cdn.meta.com/image123.jpg' } });

      const body = makeWebhookBody([
        {
          from: '919876543210',
          id: 'msg2',
          timestamp: '1710000000',
          type: 'image',
          image: { id: 'img_001', mime_type: 'image/jpeg', sha256: 'abc' },
        },
      ]);

      await injectSigned(body);
      await new Promise((r) => setTimeout(r, 50));

      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://graph.facebook.com/v21.0/img_001',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-access-token' },
        }),
      );

      expect(mockHandleMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '919876543210',
          type: 'image',
          imageUrl: 'https://cdn.meta.com/image123.jpg',
          text: '',
        }),
        mockWhatsAppClient,
      );
    });

    it('routes image messages with caption', async () => {
      mockAxiosGet.mockResolvedValue({ data: { url: 'https://cdn.meta.com/img.jpg' } });

      const body = makeWebhookBody([
        {
          from: '919876543210',
          id: 'msg3',
          timestamp: '1710000000',
          type: 'image',
          image: { id: 'img_002', mime_type: 'image/jpeg', sha256: 'abc', caption: 'My prescription' },
        },
      ]);

      await injectSigned(body);
      await new Promise((r) => setTimeout(r, 50));

      expect(mockHandleMessage).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'My prescription' }),
        mockWhatsAppClient,
      );
    });

    it('routes interactive button_reply messages', async () => {
      const body = makeWebhookBody([
        {
          from: '919876543210',
          id: 'msg4',
          timestamp: '1710000000',
          type: 'interactive',
          interactive: { type: 'button_reply', button_reply: { id: 'btn_yes', title: 'Yes' } },
        },
      ]);

      await injectSigned(body);
      await new Promise((r) => setTimeout(r, 50));

      expect(mockHandleMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'interactive', text: 'Yes' }),
        mockWhatsAppClient,
      );
    });

    it('routes button messages', async () => {
      const body = makeWebhookBody([
        {
          from: '919876543210',
          id: 'msg5',
          timestamp: '1710000000',
          type: 'button',
          button: { text: 'Get Started', payload: 'start' },
        },
      ]);

      await injectSigned(body);
      await new Promise((r) => setTimeout(r, 50));

      expect(mockHandleMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'button', text: 'Get Started' }),
        mockWhatsAppClient,
      );
    });

    it('skips unknown message types', async () => {
      const body = makeWebhookBody([
        { from: '919876543210', id: 'msg6', timestamp: '1710000000', type: 'location' },
      ]);

      await injectSigned(body);
      await new Promise((r) => setTimeout(r, 50));

      expect(mockHandleMessage).not.toHaveBeenCalled();
    });

    it('skips status updates', async () => {
      const body = makeWebhookBody([], [
        { id: 'msg1', status: 'delivered', timestamp: '1710000000', recipient_id: '919876543210' },
      ]);

      await injectSigned(body);
      await new Promise((r) => setTimeout(r, 50));

      expect(mockHandleMessage).not.toHaveBeenCalled();
    });

    it('skips non-whatsapp_business_account objects', async () => {
      const body = { object: 'instagram', entry: [] };

      await injectSigned(body);
      await new Promise((r) => setTimeout(r, 50));

      expect(mockHandleMessage).not.toHaveBeenCalled();
    });

    it('handles getImageUrl failure gracefully (skips message)', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Network error'));

      const body = makeWebhookBody([
        {
          from: '919876543210',
          id: 'msg7',
          timestamp: '1710000000',
          type: 'image',
          image: { id: 'img_fail', mime_type: 'image/jpeg', sha256: 'abc' },
        },
      ]);

      await injectSigned(body);
      await new Promise((r) => setTimeout(r, 50));

      expect(mockHandleMessage).not.toHaveBeenCalled();
    });

    it('handles handleMessage error without crashing', async () => {
      mockHandleMessage.mockRejectedValueOnce(new Error('Handler crash'));

      const body = makeWebhookBody([
        { from: '919876543210', id: 'msg8', timestamp: '1710000000', type: 'text', text: { body: 'crash me' } },
      ]);

      const response = await injectSigned(body);
      expect(response.statusCode).toBe(200);
    });

    it('processes multiple messages in a single webhook call', async () => {
      const body = makeWebhookBody([
        { from: '919876543210', id: 'msg9', timestamp: '1710000000', type: 'text', text: { body: 'Hello' } },
        { from: '919876543211', id: 'msg10', timestamp: '1710000001', type: 'text', text: { body: 'Hi' } },
      ]);

      await injectSigned(body);
      await new Promise((r) => setTimeout(r, 50));

      expect(mockHandleMessage).toHaveBeenCalledTimes(2);
    });

    it('handles empty entry array gracefully', async () => {
      const body = { object: 'whatsapp_business_account', entry: [] };

      const response = await injectSigned(body);
      expect(response.statusCode).toBe(200);
      expect(mockHandleMessage).not.toHaveBeenCalled();
    });

    it('handles empty messages array gracefully', async () => {
      const body = makeWebhookBody([]);

      const response = await injectSigned(body);
      expect(response.statusCode).toBe(200);
      expect(mockHandleMessage).not.toHaveBeenCalled();
    });
  });
});
