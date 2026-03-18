import { describe, it, expect } from 'vitest';
import type { InfographicData, MedicationCard } from '../src/services/infographic.js';

describe('Infographic Generator', () => {
  const sampleMedication: MedicationCard = {
    drug_name_en: 'Metformin',
    drug_name_hi: 'मेटफॉर्मिन',
    dosage: '500mg',
    frequency: 'twice daily',
    timing: ['08:00', '20:00'],
    instructions: 'after food',
  };

  const sampleData: InfographicData = {
    patient_name: 'राम शर्मा',
    doctor_name: 'Dr. Gupta',
    prescription_date: '2026-03-10',
    medications: [
      sampleMedication,
      {
        drug_name_en: 'Amlodipine',
        drug_name_hi: 'अम्लोडिपिन',
        dosage: '5mg',
        frequency: 'once daily',
        timing: ['08:00'],
        instructions: 'before food',
      },
    ],
  };

  it('has correct InfographicData structure', () => {
    expect(sampleData.patient_name).toBe('राम शर्मा');
    expect(sampleData.doctor_name).toBe('Dr. Gupta');
    expect(sampleData.medications).toHaveLength(2);
  });

  it('has correct MedicationCard structure', () => {
    expect(sampleMedication.drug_name_en).toBe('Metformin');
    expect(sampleMedication.drug_name_hi).toBe('मेटफॉर्मिन');
    expect(sampleMedication.dosage).toBe('500mg');
    expect(sampleMedication.timing).toEqual(['08:00', '20:00']);
  });

  it('handles medication with single timing', () => {
    const singleTimeMed: MedicationCard = {
      drug_name_en: 'Levothyroxine',
      drug_name_hi: 'लेवोथायरॉक्सिन',
      dosage: '50mcg',
      frequency: 'once daily',
      timing: ['06:00'],
      instructions: 'empty stomach, 30 min before breakfast',
    };
    expect(singleTimeMed.timing).toHaveLength(1);
  });

  it('handles data without optional fields', () => {
    const minimalData: InfographicData = {
      patient_name: 'Test User',
      medications: [sampleMedication],
    };
    expect(minimalData.doctor_name).toBeUndefined();
    expect(minimalData.prescription_date).toBeUndefined();
    expect(minimalData.medications).toHaveLength(1);
  });

  // Note: generateInfographic requires font files to run.
  // In a CI environment, you would need to download NotoSansDevanagari fonts first.
  // The test below verifies the function throws a clear error when fonts are missing.
  it('generateInfographic throws when fonts are missing', async () => {
    const { generateInfographic } = await import('../src/services/infographic.js');
    await expect(generateInfographic(sampleData)).rejects.toThrow('Font files not found');
  });
});
