import { describe, it, expect } from "vitest";
import {
  passphraseSchema,
  beneficiarySchema,
  planSchema,
  checkInSchema,
} from "@/lib/validations";

describe("passphraseSchema", () => {
  it("rejects passphrases shorter than 12 characters", () => {
    const result = passphraseSchema.safeParse("short");
    expect(result.success).toBe(false);
  });

  it("rejects common weak passphrases", () => {
    const weakPassphrases = [
      "password1234",
      "password12345",
      "123456789012",
      "aaaaaaaaaaaa",
    ];
    for (const weak of weakPassphrases) {
      const result = passphraseSchema.safeParse(weak);
      expect(result.success).toBe(false);
    }
  });

  it("rejects low-entropy passphrases", () => {
    const result = passphraseSchema.safeParse("aabbccddaabb");
    expect(result.success).toBe(false);
  });

  it("accepts strong passphrases", () => {
    const strong = [
      "correct-horse-battery-staple",
      "MyS3cur3P@ssphr4se!",
      "the-quick-brown-fox",
      "R4nd0m$tr1ng#2024",
    ];
    for (const p of strong) {
      const result = passphraseSchema.safeParse(p);
      expect(result.success).toBe(true);
    }
  });

  it("accepts exactly 12-character strong passphrase", () => {
    const result = passphraseSchema.safeParse("Abc123!@#xyz");
    expect(result.success).toBe(true);
  });
});

describe("beneficiarySchema", () => {
  it("accepts valid beneficiary", () => {
    const result = beneficiarySchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts beneficiary with phone", () => {
    const result = beneficiarySchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+1-555-0123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts beneficiary with empty phone", () => {
    const result = beneficiarySchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = beneficiarySchema.safeParse({
      name: "",
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const invalid = ["notanemail", "missing@", "@nodomain", "spaces in@email.com"];
    for (const email of invalid) {
      const result = beneficiarySchema.safeParse({
        name: "Test",
        email,
      });
      expect(result.success).toBe(false);
    }
  });

  it("accepts valid email formats", () => {
    const valid = [
      "user@example.com",
      "user.name@example.co.uk",
      "user+tag@domain.org",
    ];
    for (const email of valid) {
      const result = beneficiarySchema.safeParse({
        name: "Test",
        email,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("planSchema", () => {
  const validPlan = {
    title: "My Recovery Plan",
    encrypted_blob: "base64encrypteddata",
    encryption_iv: "base64iv",
    encryption_salt: "base64salt",
    check_in_interval_days: 90,
    template_ids: ["coinbase"],
    beneficiaries: [{ name: "John", email: "john@example.com" }],
  };

  it("accepts valid plan", () => {
    const result = planSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
  });

  it("rejects plan without beneficiaries", () => {
    const result = planSchema.safeParse({
      ...validPlan,
      beneficiaries: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects plan without template_ids", () => {
    const result = planSchema.safeParse({
      ...validPlan,
      template_ids: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects interval > 365 days", () => {
    const result = planSchema.safeParse({
      ...validPlan,
      check_in_interval_days: 400,
    });
    expect(result.success).toBe(false);
  });

  it("rejects interval < 1 day", () => {
    const result = planSchema.safeParse({
      ...validPlan,
      check_in_interval_days: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("checkInSchema", () => {
  it("accepts valid UUID", () => {
    const result = checkInSchema.safeParse({
      plan_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID string", () => {
    const result = checkInSchema.safeParse({
      plan_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = checkInSchema.safeParse({
      plan_id: "",
    });
    expect(result.success).toBe(false);
  });
});
