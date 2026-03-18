import { describe, it, expect } from 'vitest';
import { isValidE164, isValidIndianPhone, normalizeIndianPhone } from '../src/utils/phone.js';

describe('Phone Utils', () => {
  // ─── isValidE164 ──────────────────────────────────────────────────────

  describe('isValidE164', () => {
    it('accepts valid Indian number', () => {
      expect(isValidE164('+919876543210')).toBe(true);
    });

    it('accepts valid US number', () => {
      expect(isValidE164('+12025551234')).toBe(true);
    });

    it('accepts valid UK number', () => {
      expect(isValidE164('+447911123456')).toBe(true);
    });

    it('accepts minimum length (7 digits after country code)', () => {
      expect(isValidE164('+1234567')).toBe(true);
    });

    it('accepts maximum length (15 digits total)', () => {
      expect(isValidE164('+123456789012345')).toBe(true);
    });

    it('rejects number without + prefix', () => {
      expect(isValidE164('919876543210')).toBe(false);
    });

    it('rejects number starting with +0', () => {
      expect(isValidE164('+0123456789')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidE164('')).toBe(false);
    });

    it('rejects number that is too short', () => {
      expect(isValidE164('+12345')).toBe(false);
    });

    it('rejects number with letters', () => {
      expect(isValidE164('+91abc543210')).toBe(false);
    });

    it('rejects number with spaces', () => {
      expect(isValidE164('+91 987 654 3210')).toBe(false);
    });
  });

  // ─── isValidIndianPhone ───────────────────────────────────────────────

  describe('isValidIndianPhone', () => {
    it('accepts valid Indian mobile starting with 9', () => {
      expect(isValidIndianPhone('+919876543210')).toBe(true);
    });

    it('accepts valid Indian mobile starting with 8', () => {
      expect(isValidIndianPhone('+918876543210')).toBe(true);
    });

    it('accepts valid Indian mobile starting with 7', () => {
      expect(isValidIndianPhone('+917876543210')).toBe(true);
    });

    it('accepts valid Indian mobile starting with 6', () => {
      expect(isValidIndianPhone('+916876543210')).toBe(true);
    });

    it('rejects Indian number starting with 5', () => {
      expect(isValidIndianPhone('+915876543210')).toBe(false);
    });

    it('rejects Indian number starting with 1', () => {
      expect(isValidIndianPhone('+911876543210')).toBe(false);
    });

    it('rejects non-Indian country code', () => {
      expect(isValidIndianPhone('+12025551234')).toBe(false);
    });

    it('rejects Indian number with too few digits', () => {
      expect(isValidIndianPhone('+91987654321')).toBe(false);
    });

    it('rejects Indian number with too many digits', () => {
      expect(isValidIndianPhone('+9198765432100')).toBe(false);
    });

    it('rejects number without + prefix', () => {
      expect(isValidIndianPhone('919876543210')).toBe(false);
    });
  });

  // ─── normalizeIndianPhone ─────────────────────────────────────────────

  describe('normalizeIndianPhone', () => {
    it('adds +91 to 10-digit number', () => {
      expect(normalizeIndianPhone('9876543210')).toBe('+919876543210');
    });

    it('adds + to 91-prefixed 12-digit number', () => {
      expect(normalizeIndianPhone('919876543210')).toBe('+919876543210');
    });

    it('returns already normalized number unchanged', () => {
      expect(normalizeIndianPhone('+919876543210')).toBe('+919876543210');
    });

    it('strips leading 0', () => {
      expect(normalizeIndianPhone('09876543210')).toBe('+919876543210');
    });

    it('strips spaces', () => {
      expect(normalizeIndianPhone('98765 43210')).toBe('+919876543210');
    });

    it('strips dashes', () => {
      expect(normalizeIndianPhone('98765-43210')).toBe('+919876543210');
    });

    it('strips parentheses', () => {
      expect(normalizeIndianPhone('(0)9876543210')).toBe('+919876543210');
    });

    it('handles mixed formatting', () => {
      expect(normalizeIndianPhone('091-9876-543210')).toBe('+919876543210');
    });

    it('handles number with spaces and dashes', () => {
      expect(normalizeIndianPhone('+91 987-654-3210')).toBe('+919876543210');
    });
  });
});
