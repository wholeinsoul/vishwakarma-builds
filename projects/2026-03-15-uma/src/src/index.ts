import Fastify from 'fastify';
import { config } from './config.js';
import { registerWebhookRoutes } from './webhook/whatsapp.js';
import { createWhatsAppClient } from './services/whatsapp-client.js';
import { startScheduler, stopScheduler } from './services/reminder-scheduler.js';

async function main() {
  const app = Fastify({ logger: true });

  // Create singleton WhatsApp client
  const whatsapp = createWhatsAppClient();

  // Health check
  app.get('/health', async () => ({ status: 'ok', service: 'uma' }));

  // Register WhatsApp webhook routes with shared client
  await registerWebhookRoutes(app, whatsapp);

  // Start reminder scheduler with shared client
  startScheduler(whatsapp);

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[Server] Shutting down...');
    stopScheduler();
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start server
  await app.listen({ port: config.port, host: '0.0.0.0' });
  console.log(`[Server] Uma listening on port ${config.port}`);
}

main().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
