import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock OpenAI ──────────────────────────────────────────────────────────
const mockOpenAICreate = vi.fn();
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockOpenAICreate,
      },
    },
  })),
}));

// ─── Mock db/queries ──────────────────────────────────────────────────────
const mockFindUserByPhone = vi.fn();
const mockCreateUser = vi.fn();
const mockUpdateUserNameByPhone = vi.fn();
const mockUpdateUserStatusByPhone = vi.fn();
const mockFindConversationByPhone = vi.fn();
const mockUpsertConversation = vi.fn();
const mockCreatePrescription = vi.fn();
const mockCreateMedication = vi.fn();
const mockFindMedicationById = vi.fn();
const mockConfirmMedication = vi.fn();
const mockDeactivateMedication = vi.fn();
const mockCreateSchedule = vi.fn();
const mockFindPendingAdherenceLogs = vi.fn();
const mockUpdateAdherenceResponse = vi.fn();
const mockCreateCaretaker = vi.fn();

vi.mock('../src/db/queries.js', () => ({
  findUserByPhone: (...args: unknown[]) => mockFindUserByPhone(...args),
  createUser: (...args: unknown[]) => mockCreateUser(...args),
  updateUserNameByPhone: (...args: unknown[]) => mockUpdateUserNameByPhone(...args),
  updateUserStatusByPhone: (...args: unknown[]) => mockUpdateUserStatusByPhone(...args),
  findConversationByPhone: (...args: unknown[]) => mockFindConversationByPhone(...args),
  upsertConversation: (...args: unknown[]) => mockUpsertConversation(...args),
  createPrescription: (...args: unknown[]) => mockCreatePrescription(...args),
  createMedication: (...args: unknown[]) => mockCreateMedication(...args),
  findMedicationById: (...args: unknown[]) => mockFindMedicationById(...args),
  confirmMedication: (...args: unknown[]) => mockConfirmMedication(...args),
  deactivateMedication: (...args: unknown[]) => mockDeactivateMedication(...args),
  createSchedule: (...args: unknown[]) => mockCreateSchedule(...args),
  findPendingAdherenceLogs: (...args: unknown[]) => mockFindPendingAdherenceLogs(...args),
  updateAdherenceResponse: (...args: unknown[]) => mockUpdateAdherenceResponse(...args),
  createCaretaker: (...args: unknown[]) => mockCreateCaretaker(...args),
}));

import { handleMessage, IncomingMessage } from '../src/conversation/engine.js';
import { ConversationState } from '../src/conversation/states.js';

describe('Integration: End-to-end flows', () => {
  const mockWhatsApp = {
    sendText: vi.fn().mockResolvedValue(undefined),
    sendImage: vi.fn().mockResolvedValue(undefined),
    sendTemplate: vi.fn().mockResolvedValue(undefined),
    markAsRead: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsertConversation.mockResolvedValue({});
  });

  // ─── Full onboarding flow ─────────────────────────────────────────────

  describe('Onboarding flow', () => {
    it('new user gets welcome and name prompt', async () => {
      mockFindConversationByPhone.mockResolvedValueOnce(null); // first call: no conversation
      mockCreateUser.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockFindConversationByPhone.mockResolvedValueOnce({
        id: 'conv1',
        phone: '+919876543210',
        state: 'idle',
        context: {},
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg1',
        type: 'text',
        text: 'Hi',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockWhatsApp.markAsRead).toHaveBeenCalledWith('msg1');
      expect(mockCreateUser).toHaveBeenCalledWith({ phone: '+919876543210' });
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Welcome to Uma'),
      );
      expect(mockUpsertConversation).toHaveBeenCalledWith(
        '+919876543210',
        ConversationState.ONBOARDING_NAME,
        expect.any(Object),
      );
    });

    it('user provides name and gets caretaker prompt', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.ONBOARDING_NAME,
        context: {},
      });
      mockUpdateUserNameByPhone.mockResolvedValue({ id: 'user1', name: 'Ramu Kaka' });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg2',
        type: 'text',
        text: 'Ramu Kaka',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockUpdateUserNameByPhone).toHaveBeenCalledWith('+919876543210', 'Ramu Kaka');
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('family member'),
      );
      expect(mockUpsertConversation).toHaveBeenCalledWith(
        '+919876543210',
        ConversationState.ONBOARDING_CARETAKER,
        expect.any(Object),
      );
    });

    it('user says no to caretaker and gets prescription prompt', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.ONBOARDING_CARETAKER,
        context: {},
      });
      mockUpdateUserStatusByPhone.mockResolvedValue({});

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg3',
        type: 'text',
        text: 'no',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockUpdateUserStatusByPhone).toHaveBeenCalledWith('+919876543210', 'active');
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('prescription'),
      );
      expect(mockUpsertConversation).toHaveBeenCalledWith(
        '+919876543210',
        ConversationState.AWAITING_PRESCRIPTION,
        expect.any(Object),
      );
    });

    it('user says yes to caretaker and enters caretaker name flow', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.ONBOARDING_CARETAKER,
        context: {},
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg3b',
        type: 'text',
        text: 'yes',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('phone number'),
      );
      expect(mockUpsertConversation).toHaveBeenCalledWith(
        '+919876543210',
        ConversationState.ONBOARDING_CARETAKER_NAME,
        expect.any(Object),
      );
    });

    it('caretaker phone is validated and caretaker created', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.ONBOARDING_CARETAKER_NAME,
        context: {},
      });
      mockFindUserByPhone.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockCreateCaretaker.mockResolvedValue({ id: 'ct1' });
      mockUpdateUserStatusByPhone.mockResolvedValue({});

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg4',
        type: 'text',
        text: '9876543211',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockCreateCaretaker).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+919876543211',
          user_id: 'user1',
        }),
      );
      expect(mockUpsertConversation).toHaveBeenCalledWith(
        '+919876543210',
        ConversationState.AWAITING_PRESCRIPTION,
        expect.any(Object),
      );
    });

    it('rejects invalid caretaker phone', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.ONBOARDING_CARETAKER_NAME,
        context: {},
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg4b',
        type: 'text',
        text: '12345',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockCreateCaretaker).not.toHaveBeenCalled();
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Invalid phone number'),
      );
    });
  });

  // ─── Prescription scan → confirmation flow ────────────────────────────

  describe('Prescription scan and medication confirmation flow', () => {
    it('processes prescription image, creates medications, starts confirmation', async () => {
      // User is in AWAITING_PRESCRIPTION state
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.AWAITING_PRESCRIPTION,
        context: {},
      });
      mockFindUserByPhone.mockResolvedValue({ id: 'user1', phone: '+919876543210' });

      // GPT-4o response
      const gptResponse = {
        doctor_name: 'Dr. Sharma',
        prescription_date: '2026-03-10',
        medications: [
          {
            drug_name_en: 'Metformin',
            drug_name_hi: 'मेटफॉर्मिन',
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
      mockOpenAICreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(gptResponse) } }],
      });

      mockCreatePrescription.mockResolvedValue({ id: 'presc1' });
      mockCreateMedication
        .mockResolvedValueOnce({ id: 'med1' })
        .mockResolvedValueOnce({ id: 'med2' });
      mockFindMedicationById.mockResolvedValue({
        id: 'med1',
        drug_name_en: 'Metformin',
        drug_name_hi: 'मेटफॉर्मिन',
        dosage: '500mg',
        frequency: 'twice daily',
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg5',
        type: 'image',
        imageUrl: 'https://cdn.meta.com/prescription.jpg',
      };

      await handleMessage(msg, mockWhatsApp);

      // Should send processing message
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Reading your prescription'),
      );

      // Should create prescription
      expect(mockCreatePrescription).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user1',
          image_url: 'https://cdn.meta.com/prescription.jpg',
          doctor_name: 'Dr. Sharma',
        }),
      );

      // Should create 2 medications
      expect(mockCreateMedication).toHaveBeenCalledTimes(2);

      // Should ask for confirmation of first medication
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Metformin'),
      );

      // Should transition to CONFIRMING_MEDICATIONS
      expect(mockUpsertConversation).toHaveBeenCalledWith(
        '+919876543210',
        ConversationState.CONFIRMING_MEDICATIONS,
        expect.objectContaining({
          prescription_id: 'presc1',
          medications_to_confirm: ['med1', 'med2'],
          current_confirm_index: 0,
        }),
      );
    });

    it('confirms a medication and creates schedule', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.CONFIRMING_MEDICATIONS,
        context: {
          prescription_id: 'presc1',
          medications_to_confirm: ['med1', 'med2'],
          current_confirm_index: 0,
        },
      });

      mockConfirmMedication.mockResolvedValue({ id: 'med1' });
      mockFindMedicationById
        .mockResolvedValueOnce({
          id: 'med1',
          drug_name_en: 'Metformin',
          drug_name_hi: 'मेटफॉर्मिन',
          dosage: '500mg',
          timing: ['08:00', '20:00'],
          duration_days: 30,
        })
        .mockResolvedValueOnce({
          id: 'med2',
          drug_name_en: 'Amlodipine',
          drug_name_hi: null,
          dosage: '5mg',
          frequency: 'once daily',
        });
      mockFindUserByPhone.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockCreateSchedule.mockResolvedValue({ id: 'sched1' });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg6',
        type: 'text',
        text: 'yes',
      };

      await handleMessage(msg, mockWhatsApp);

      // Should confirm medication
      expect(mockConfirmMedication).toHaveBeenCalledWith('med1');

      // Should create schedules for each timing
      expect(mockCreateSchedule).toHaveBeenCalledTimes(2);
      expect(mockCreateSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user1',
          medication_id: 'med1',
          reminder_time: '08:00',
        }),
      );

      // Should prompt for next medication
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Amlodipine'),
      );

      // Should stay in CONFIRMING with incremented index
      expect(mockUpsertConversation).toHaveBeenCalledWith(
        '+919876543210',
        ConversationState.CONFIRMING_MEDICATIONS,
        expect.objectContaining({ current_confirm_index: 1 }),
      );
    });

    it('rejects a medication and moves to next', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.CONFIRMING_MEDICATIONS,
        context: {
          prescription_id: 'presc1',
          medications_to_confirm: ['med1', 'med2'],
          current_confirm_index: 0,
        },
      });

      mockDeactivateMedication.mockResolvedValue({ id: 'med1' });
      mockFindMedicationById.mockResolvedValue({
        id: 'med2',
        drug_name_en: 'Amlodipine',
        drug_name_hi: null,
        dosage: '5mg',
        frequency: 'once daily',
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg7',
        type: 'text',
        text: 'no',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockDeactivateMedication).toHaveBeenCalledWith('med1');
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('removed'),
      );
    });

    it('completes all confirmations and shows success', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.CONFIRMING_MEDICATIONS,
        context: {
          prescription_id: 'presc1',
          medications_to_confirm: ['med1'],
          current_confirm_index: 0,
        },
      });

      mockConfirmMedication.mockResolvedValue({ id: 'med1' });
      mockFindMedicationById.mockResolvedValue({
        id: 'med1',
        drug_name_en: 'Metformin',
        dosage: '500mg',
        timing: ['08:00'],
        duration_days: 30,
      });
      mockFindUserByPhone.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockCreateSchedule.mockResolvedValue({ id: 'sched1' });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg8',
        type: 'text',
        text: 'yes',
      };

      await handleMessage(msg, mockWhatsApp);

      // All confirmed message
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('All medications confirmed'),
      );
      // Disclaimer
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('not medical advice'),
      );
      // Should return to AWAITING_PRESCRIPTION
      expect(mockUpsertConversation).toHaveBeenCalledWith(
        '+919876543210',
        ConversationState.AWAITING_PRESCRIPTION,
        {},
      );
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('sends ask-prescription when text sent in AWAITING_PRESCRIPTION state', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.AWAITING_PRESCRIPTION,
        context: {},
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg9',
        type: 'text',
        text: 'Hello',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('prescription'),
      );
    });

    it('sends processing message when text sent in PROCESSING_PRESCRIPTION state', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.PROCESSING_PRESCRIPTION,
        context: {},
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg10',
        type: 'text',
        text: 'Hello',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Reading your prescription'),
      );
    });

    it('handles short name gracefully (< 2 chars)', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.ONBOARDING_NAME,
        context: {},
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg11',
        type: 'text',
        text: 'A',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockUpdateUserNameByPhone).not.toHaveBeenCalled();
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining("didn't understand"),
      );
    });

    it('handles invalid yes/no at caretaker stage', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.ONBOARDING_CARETAKER,
        context: {},
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg12',
        type: 'text',
        text: 'maybe',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining("didn't understand"),
      );
    });

    it('handles invalid yes/no at medication confirmation', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.CONFIRMING_MEDICATIONS,
        context: {
          medications_to_confirm: ['med1'],
          current_confirm_index: 0,
        },
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg13',
        type: 'text',
        text: 'maybe',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockConfirmMedication).not.toHaveBeenCalled();
      expect(mockDeactivateMedication).not.toHaveBeenCalled();
    });

    it('handles prescription with no medications', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.AWAITING_PRESCRIPTION,
        context: {},
      });
      mockFindUserByPhone.mockResolvedValue({ id: 'user1', phone: '+919876543210' });

      mockOpenAICreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify({ doctor_name: 'Dr. X' }) } }],
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg14',
        type: 'image',
        imageUrl: 'https://cdn.meta.com/empty.jpg',
      };

      await handleMessage(msg, mockWhatsApp);

      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Could not read'),
      );
    });

    it('handles Hindi affirmative responses', async () => {
      mockFindConversationByPhone.mockResolvedValue({
        id: 'conv1',
        phone: '+919876543210',
        state: ConversationState.ONBOARDING_CARETAKER,
        context: {},
      });

      const msg: IncomingMessage = {
        phone: '+919876543210',
        messageId: 'msg15',
        type: 'text',
        text: 'हाँ',
      };

      await handleMessage(msg, mockWhatsApp);

      // Should proceed to caretaker name flow
      expect(mockUpsertConversation).toHaveBeenCalledWith(
        '+919876543210',
        ConversationState.ONBOARDING_CARETAKER_NAME,
        expect.any(Object),
      );
    });
  });
});
