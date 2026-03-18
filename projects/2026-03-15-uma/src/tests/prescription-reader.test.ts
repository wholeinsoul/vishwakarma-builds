import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

import { readPrescription } from '../src/services/prescription-reader.js';

describe('Prescription Reader', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('parses a valid GPT-4o response', async () => {
    const mockResponse = {
      doctor_name: 'Dr. Sharma',
      prescription_date: '2026-03-10',
      medications: [
        {
          drug_name_en: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          timing: ['08:00', '20:00'],
          instructions: 'after food',
          duration_days: 30,
        },
        {
          drug_name_en: 'Amlodipine',
          dosage: '5mg',
          frequency: 'once daily',
          timing: ['08:00'],
          instructions: 'before food',
          duration_days: 30,
        },
      ],
    };

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    });

    const result = await readPrescription('https://example.com/prescription.jpg');

    expect(result.doctor_name).toBe('Dr. Sharma');
    expect(result.prescription_date).toBe('2026-03-10');
    expect(result.medications).toHaveLength(2);
    expect(result.medications[0].drug_name_en).toBe('Metformin');
    expect(result.medications[0].dosage).toBe('500mg');
    expect(result.medications[0].timing).toEqual(['08:00', '20:00']);
    expect(result.medications[1].drug_name_en).toBe('Amlodipine');
    expect(result.raw_response).toBe(JSON.stringify(mockResponse));
  });

  it('handles response with markdown code blocks', async () => {
    const mockResponse = {
      medications: [
        {
          drug_name_en: 'Paracetamol',
          dosage: '500mg',
          frequency: 'as needed',
          timing: ['08:00'],
          instructions: 'after food',
        },
      ],
    };

    mockCreate.mockResolvedValue({
      choices: [
        { message: { content: '```json\n' + JSON.stringify(mockResponse) + '\n```' } },
      ],
    });

    const result = await readPrescription('https://example.com/prescription.jpg');
    expect(result.medications).toHaveLength(1);
    expect(result.medications[0].drug_name_en).toBe('Paracetamol');
  });

  it('throws on unparseable response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'This is not valid JSON at all' } }],
    });

    await expect(
      readPrescription('https://example.com/prescription.jpg')
    ).rejects.toThrow('Failed to parse GPT-4o response');
  });

  it('returns empty medications when none found', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ doctor_name: 'Dr. Kumar' }) } }],
    });

    const result = await readPrescription('https://example.com/prescription.jpg');
    expect(result.medications).toHaveLength(0);
    expect(result.doctor_name).toBe('Dr. Kumar');
  });
});
