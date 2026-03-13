import { createHash } from 'crypto';

const SALT = process.env.IP_HASH_SALT || 'pumpline-default-salt';

export function hashIP(ip: string): string {
  return createHash('sha256').update(`${SALT}:${ip}`).digest('hex');
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
