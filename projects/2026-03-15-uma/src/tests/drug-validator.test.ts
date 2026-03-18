import { describe, it, expect } from 'vitest';
import { findDrug, validateMedication, getDrugHindiName, getDrugFoodInstructions } from '../src/services/drug-validator.js';

describe('Drug Validator', () => {
  describe('findDrug', () => {
    it('finds a drug by generic name', () => {
      const drug = findDrug('Metformin');
      expect(drug).toBeDefined();
      expect(drug!.generic_name).toBe('Metformin');
      expect(drug!.category).toBe('Diabetes');
    });

    it('finds a drug by brand name', () => {
      const drug = findDrug('Glycomet');
      expect(drug).toBeDefined();
      expect(drug!.generic_name).toBe('Metformin');
    });

    it('finds a drug case-insensitively', () => {
      const drug = findDrug('metformin');
      expect(drug).toBeDefined();
      expect(drug!.generic_name).toBe('Metformin');
    });

    it('returns undefined for unknown drug', () => {
      const drug = findDrug('FakeDrugXYZ');
      expect(drug).toBeUndefined();
    });

    it('finds Paracetamol by brand Crocin', () => {
      const drug = findDrug('Crocin');
      expect(drug).toBeDefined();
      expect(drug!.generic_name).toBe('Paracetamol');
    });

    it('finds Amlodipine by brand Amlong', () => {
      const drug = findDrug('Amlong');
      expect(drug).toBeDefined();
      expect(drug!.generic_name).toBe('Amlodipine');
    });

    it('finds Telmisartan by brand Telma', () => {
      const drug = findDrug('Telma');
      expect(drug).toBeDefined();
      expect(drug!.generic_name).toBe('Telmisartan');
    });
  });

  describe('validateMedication', () => {
    it('validates a known drug with common dose', () => {
      const result = validateMedication('Metformin', '500mg', 'twice daily');
      expect(result.found).toBe(true);
      expect(result.drug).toBeDefined();
      expect(result.warnings.length).toBe(0);
    });

    it('flags unknown drug', () => {
      const result = validateMedication('UnknownDrug', '100mg', 'once daily');
      expect(result.found).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Unknown drug');
    });

    it('warns about unusual dosage', () => {
      const result = validateMedication('Metformin', '1500mg', 'once daily');
      expect(result.found).toBe(true);
      expect(result.warnings.some(w => w.includes('Unusual dosage'))).toBe(true);
    });

    it('warns about exceeding max daily dose', () => {
      const result = validateMedication('Paracetamol', '2000mg', 'thrice daily');
      expect(result.found).toBe(true);
      expect(result.warnings.some(w => w.includes('High dose warning'))).toBe(true);
    });

    it('does not warn for normal Amlodipine dose', () => {
      const result = validateMedication('Amlodipine', '5mg', 'once daily');
      expect(result.found).toBe(true);
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('getDrugHindiName', () => {
    it('returns Hindi name for known drug', () => {
      const hindi = getDrugHindiName('Metformin');
      expect(hindi).toBeDefined();
      expect(hindi!.length).toBeGreaterThan(0);
    });

    it('returns undefined for unknown drug', () => {
      const hindi = getDrugHindiName('FakeDrug');
      expect(hindi).toBeUndefined();
    });
  });

  describe('getDrugFoodInstructions', () => {
    it('returns food instructions for known drug', () => {
      const instructions = getDrugFoodInstructions('Metformin');
      expect(instructions).toBeDefined();
      expect(instructions!.length).toBeGreaterThan(0);
    });

    it('returns undefined for unknown drug', () => {
      const instructions = getDrugFoodInstructions('FakeDrug');
      expect(instructions).toBeUndefined();
    });
  });
});
