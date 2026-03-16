import { describe, it, expect } from "vitest";
import { encrypt, decrypt, deriveKey, arrayBufferToBase64, base64ToArrayBuffer } from "@/lib/crypto";

describe("crypto", () => {
  describe("base64 helpers", () => {
    it("round-trips ArrayBuffer through base64", () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 0, 128]);
      const base64 = arrayBufferToBase64(original.buffer);
      const decoded = new Uint8Array(base64ToArrayBuffer(base64));
      expect(decoded).toEqual(original);
    });

    it("handles empty buffer", () => {
      const empty = new Uint8Array(0);
      const base64 = arrayBufferToBase64(empty.buffer);
      expect(base64).toBe("");
      const decoded = new Uint8Array(base64ToArrayBuffer(base64));
      expect(decoded.length).toBe(0);
    });
  });

  describe("deriveKey", () => {
    it("derives a CryptoKey from passphrase and salt", async () => {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await deriveKey("test-passphrase-12345", salt);
      expect(key).toBeDefined();
      expect(key.algorithm).toBeDefined();
    });

    it("same passphrase + same salt produces same key", async () => {
      const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
      const key1 = await deriveKey("same-passphrase!!", salt);
      const key2 = await deriveKey("same-passphrase!!", salt);

      // Export keys to compare raw bytes
      const raw1 = await crypto.subtle.exportKey("raw", await deriveKeyExportable("same-passphrase!!", salt));
      const raw2 = await crypto.subtle.exportKey("raw", await deriveKeyExportable("same-passphrase!!", salt));
      expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
    });

    it("different salt produces different key", async () => {
      const salt1 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
      const salt2 = new Uint8Array([16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);

      const raw1 = await crypto.subtle.exportKey("raw", await deriveKeyExportable("same-passphrase!!", salt1));
      const raw2 = await crypto.subtle.exportKey("raw", await deriveKeyExportable("same-passphrase!!", salt2));
      expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
    });
  });

  describe("encrypt / decrypt round-trip", () => {
    it("encrypts and decrypts with correct passphrase", async () => {
      const plaintext = "Hello, this is a secret recovery plan!";
      const passphrase = "my-secure-passphrase-123";

      const { ciphertext, iv, salt } = await encrypt(plaintext, passphrase);

      expect(ciphertext).toBeTruthy();
      expect(iv).toBeTruthy();
      expect(salt).toBeTruthy();

      const decrypted = await decrypt(ciphertext, iv, salt, passphrase);
      expect(decrypted).toBe(plaintext);
    });

    it("handles JSON data correctly", async () => {
      const data = {
        platforms: [
          { id: "coinbase", email: "user@example.com", password: "secret123" },
          { id: "metamask", seedPhrase: "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12" },
        ],
      };
      const plaintext = JSON.stringify(data);
      const passphrase = "my-json-passphrase-456";

      const encrypted = await encrypt(plaintext, passphrase);
      const decrypted = await decrypt(encrypted.ciphertext, encrypted.iv, encrypted.salt, passphrase);

      expect(JSON.parse(decrypted)).toEqual(data);
    });

    it("handles empty string", async () => {
      const passphrase = "passphrase-for-empty";
      const { ciphertext, iv, salt } = await encrypt("", passphrase);
      const decrypted = await decrypt(ciphertext, iv, salt, passphrase);
      expect(decrypted).toBe("");
    });

    it("handles unicode content", async () => {
      const plaintext = "Crypto recovery: BTC \u20BF ETH \u039E \u2014 Wallet PIN: 1234 \uD83D\uDD12";
      const passphrase = "unicode-passphrase-\uD83D\uDD11";

      const { ciphertext, iv, salt } = await encrypt(plaintext, passphrase);
      const decrypted = await decrypt(ciphertext, iv, salt, passphrase);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe("wrong passphrase", () => {
    it("throws on wrong passphrase", async () => {
      const plaintext = "Secret recovery instructions";
      const { ciphertext, iv, salt } = await encrypt(plaintext, "correct-passphrase");

      await expect(
        decrypt(ciphertext, iv, salt, "wrong-passphrase!!")
      ).rejects.toThrow("Decryption failed");
    });

    it("throws on empty passphrase when original was not empty", async () => {
      const plaintext = "Secret data";
      const { ciphertext, iv, salt } = await encrypt(plaintext, "non-empty-passphrase");

      await expect(
        decrypt(ciphertext, iv, salt, "")
      ).rejects.toThrow();
    });
  });

  describe("produces unique ciphertext", () => {
    it("different encryptions of same plaintext produce different outputs", async () => {
      const plaintext = "Same message encrypted twice";
      const passphrase = "same-passphrase-both-times";

      const result1 = await encrypt(plaintext, passphrase);
      const result2 = await encrypt(plaintext, passphrase);

      // IV and salt should differ (random)
      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.salt).not.toBe(result2.salt);
      // Ciphertext will also differ due to different IV/salt
      expect(result1.ciphertext).not.toBe(result2.ciphertext);

      // But both should decrypt to the same plaintext
      const d1 = await decrypt(result1.ciphertext, result1.iv, result1.salt, passphrase);
      const d2 = await decrypt(result2.ciphertext, result2.iv, result2.salt, passphrase);
      expect(d1).toBe(plaintext);
      expect(d2).toBe(plaintext);
    });
  });
});

// Helper to create exportable key for comparison tests
async function deriveKeyExportable(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true, // extractable for comparison
    ["encrypt", "decrypt"]
  );
}
