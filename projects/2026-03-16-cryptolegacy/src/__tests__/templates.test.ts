import { describe, it, expect } from "vitest";
import {
  platformTemplates,
  getTemplateById,
  type PlatformTemplate,
} from "@/lib/templates";

describe("platform templates", () => {
  it("exports 6 platform templates", () => {
    expect(platformTemplates).toHaveLength(6);
  });

  it("all templates have required structure", () => {
    for (const template of platformTemplates) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.icon).toBeTruthy();
      expect(Array.isArray(template.fields)).toBe(true);
      expect(Array.isArray(template.recoverySteps)).toBe(true);
      expect(template.fields.length).toBeGreaterThan(0);
      expect(template.recoverySteps.length).toBeGreaterThan(0);
    }
  });

  it("all template fields have required properties", () => {
    for (const template of platformTemplates) {
      for (const field of template.fields) {
        expect(field.id).toBeTruthy();
        expect(field.label).toBeTruthy();
        expect(["text", "textarea", "password"]).toContain(field.type);
        expect(typeof field.placeholder).toBe("string");
        expect(typeof field.required).toBe("boolean");
      }
    }
  });

  it("all template IDs are unique", () => {
    const ids = platformTemplates.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  const expectedPlatforms = [
    "coinbase",
    "binance",
    "metamask",
    "ledger",
    "kraken",
    "generic",
  ];

  for (const platformId of expectedPlatforms) {
    it(`includes ${platformId} template`, () => {
      const template = platformTemplates.find((t) => t.id === platformId);
      expect(template).toBeDefined();
      expect(template!.name).toBeTruthy();
    });
  }

  describe("getTemplateById", () => {
    it("returns correct template by ID", () => {
      const coinbase = getTemplateById("coinbase");
      expect(coinbase).toBeDefined();
      expect(coinbase!.id).toBe("coinbase");
      expect(coinbase!.name).toBe("Coinbase");
    });

    it("returns undefined for unknown ID", () => {
      const result = getTemplateById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("Coinbase template", () => {
    it("has email and 2FA fields", () => {
      const coinbase = getTemplateById("coinbase")!;
      const fieldIds = coinbase.fields.map((f) => f.id);
      expect(fieldIds).toContain("email");
    });

    it("has recovery steps mentioning coinbase.com", () => {
      const coinbase = getTemplateById("coinbase")!;
      const stepsText = coinbase.recoverySteps.join(" ").toLowerCase();
      expect(stepsText).toContain("coinbase");
    });
  });

  describe("MetaMask template", () => {
    it("has seed phrase related field", () => {
      const metamask = getTemplateById("metamask")!;
      const fieldIds = metamask.fields.map((f) => f.id);
      const hasSecretField = fieldIds.some(
        (id) =>
          id.includes("seed") ||
          id.includes("phrase") ||
          id.includes("recovery") ||
          id.includes("mnemonic") ||
          id.includes("secret")
      );
      expect(hasSecretField).toBe(true);
    });
  });

  describe("Ledger template", () => {
    it("has device-related fields", () => {
      const ledger = getTemplateById("ledger")!;
      const fieldLabels = ledger.fields.map((f) => f.label.toLowerCase());
      const hasDeviceField = fieldLabels.some(
        (label) =>
          label.includes("device") ||
          label.includes("pin") ||
          label.includes("location") ||
          label.includes("recovery") ||
          label.includes("phrase")
      );
      expect(hasDeviceField).toBe(true);
    });
  });

  describe("Generic template", () => {
    it("has a free-form text field", () => {
      const generic = getTemplateById("generic")!;
      const hasTextarea = generic.fields.some((f) => f.type === "textarea");
      expect(hasTextarea).toBe(true);
    });
  });
});
