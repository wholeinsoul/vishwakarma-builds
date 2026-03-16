import { z } from 'zod';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Estimate the Shannon entropy of a string (bits per character * length).
 * Low entropy means the string is repetitive or trivially guessable.
 */
function shannonEntropy(s: string): number {
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  let entropy = 0;
  const values = Array.from(freq.values());
  for (const count of values) {
    const p = count / s.length;
    entropy -= p * Math.log2(p);
  }
  // Total entropy = bits-per-char * length
  return entropy * s.length;
}

/** Common weak passphrases that should always be rejected. */
const WEAK_PASSPHRASES = new Set([
  'password1234',
  'password12345',
  'password123456',
  'password1234567',
  'password12345678',
  'password123',
  '123456789012',
  'qwertyuiopas',
  'abcdefghijkl',
  'aaaaaaaaaaaa',
  'letmein12345',
  'changeme1234',
]);

// ---------------------------------------------------------------------------
// Passphrase
// ---------------------------------------------------------------------------

export const passphraseSchema = z
  .string()
  .min(12, 'Passphrase must be at least 12 characters')
  .refine(
    (val) => !WEAK_PASSPHRASES.has(val.toLowerCase()),
    'This passphrase is too common. Please choose something less predictable.',
  )
  .refine(
    (val) => shannonEntropy(val) >= 28,
    'Passphrase is too simple. Use a mix of words, numbers, and symbols.',
  );

// ---------------------------------------------------------------------------
// Beneficiary
// ---------------------------------------------------------------------------

export const beneficiarySchema = z.object({
  name: z
    .string()
    .min(1, 'Beneficiary name is required')
    .max(200, 'Name must be 200 characters or fewer'),
  email: z
    .string()
    .email('A valid email address is required'),
  phone: z
    .string()
    .max(30, 'Phone number must be 30 characters or fewer')
    .optional()
    .or(z.literal('')),
});

export type Beneficiary = z.infer<typeof beneficiarySchema>;

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

export const planSchema = z.object({
  title: z
    .string()
    .min(1, 'Plan title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  encrypted_blob: z
    .string()
    .min(1, 'Encrypted data is required'),
  encryption_iv: z
    .string()
    .min(1, 'Encryption IV is required'),
  encryption_salt: z
    .string()
    .min(1, 'Encryption salt is required'),
  check_in_interval_days: z
    .number()
    .int()
    .min(1, 'Check-in interval must be at least 1 day')
    .max(365, 'Check-in interval must be 365 days or fewer'),
  template_ids: z
    .array(z.string())
    .min(1, 'At least one template must be selected'),
  beneficiaries: z
    .array(beneficiarySchema)
    .min(1, 'At least one beneficiary is required'),
});

export type PlanInput = z.infer<typeof planSchema>;

// ---------------------------------------------------------------------------
// Check-in
// ---------------------------------------------------------------------------

export const checkInSchema = z.object({
  plan_id: z
    .string()
    .uuid('plan_id must be a valid UUID'),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
