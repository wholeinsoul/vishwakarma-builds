import crypto from 'crypto';
import { config } from '../config.js';
import { handleMessage } from '../conversation/engine.js';
import { createWhatsAppClient } from '../services/whatsapp-client.js';
function verifySignature(rawBody, signature) {
    if (!signature)
        return false;
    const secret = config.whatsapp.appSecret;
    if (!secret) {
        console.error('[Webhook] WHATSAPP_APP_SECRET not set — cannot verify signatures');
        return false;
    }
    const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expectedSig}`));
}
async function getImageUrl(imageId) {
    // Fetch image URL from Meta API
    const axios = (await import('axios')).default;
    const response = await axios.get(`${config.whatsapp.apiBaseUrl}/${imageId}`, {
        headers: { Authorization: `Bearer ${config.whatsapp.accessToken}` },
    });
    return response.data.url;
}
export async function registerWebhookRoutes(app, whatsappClient) {
    const sharedClient = whatsappClient || createWhatsAppClient();
    // Webhook verification (GET)
    app.get('/webhook/whatsapp', async (request, reply) => {
        const mode = request.query['hub.mode'];
        const token = request.query['hub.verify_token'];
        const challenge = request.query['hub.challenge'];
        if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
            console.log('[Webhook] Verification successful');
            return reply.code(200).send(challenge);
        }
        console.warn('[Webhook] Verification failed');
        return reply.code(403).send('Forbidden');
    });
    // Add raw body support for signature verification
    app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_req, body, done) => {
        try {
            const json = JSON.parse(body.toString());
            json.__rawBody = body;
            done(null, json);
        }
        catch (err) {
            done(err, undefined);
        }
    });
    // Webhook handler (POST)
    app.post('/webhook/whatsapp', async (request, reply) => {
        // Signature verification (optional in dev)
        if (config.nodeEnv === 'production') {
            const signature = request.headers['x-hub-signature-256'];
            const rawBody = request.body.__rawBody;
            if (rawBody && !verifySignature(rawBody, signature)) {
                console.warn('[Webhook] Invalid signature');
                return reply.code(401).send('Unauthorized');
            }
        }
        // Always respond 200 quickly to Meta
        reply.code(200).send('EVENT_RECEIVED');
        const body = request.body;
        if (body.object !== 'whatsapp_business_account')
            return;
        for (const entry of body.entry || []) {
            for (const change of entry.changes || []) {
                if (change.field !== 'messages')
                    continue;
                const value = change.value;
                // Skip status updates
                if (value.statuses)
                    continue;
                for (const msg of value.messages || []) {
                    const incoming = {
                        phone: msg.from,
                        messageId: msg.id,
                        type: 'unknown',
                    };
                    switch (msg.type) {
                        case 'text':
                            incoming.type = 'text';
                            incoming.text = msg.text?.body || '';
                            break;
                        case 'image':
                            incoming.type = 'image';
                            if (msg.image?.id) {
                                try {
                                    incoming.imageUrl = await getImageUrl(msg.image.id);
                                }
                                catch (err) {
                                    console.error('[Webhook] Failed to get image URL:', err);
                                    continue;
                                }
                            }
                            incoming.text = msg.image?.caption || '';
                            break;
                        case 'interactive':
                            incoming.type = 'interactive';
                            incoming.text = msg.interactive?.button_reply?.title || '';
                            break;
                        case 'button':
                            incoming.type = 'button';
                            incoming.text = msg.button?.text || '';
                            break;
                        default:
                            continue;
                    }
                    try {
                        await handleMessage(incoming, sharedClient);
                    }
                    catch (err) {
                        console.error(`[Webhook] Error processing message from ${msg.from}:`, err);
                    }
                }
            }
        }
    });
}
//# sourceMappingURL=whatsapp.js.map