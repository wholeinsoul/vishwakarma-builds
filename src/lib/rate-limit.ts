// Rate limiting placeholder
// In production, replace with Upstash Redis: @upstash/ratelimit
// For now, uses in-memory store (resets on server restart)

const requests = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

export function checkRateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = requests.get(ip);

  if (!record || now > record.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  const updated = { count: record.count + 1, resetAt: record.resetAt };
  requests.set(ip, updated);
  return { success: true, remaining: MAX_REQUESTS - updated.count };
}
