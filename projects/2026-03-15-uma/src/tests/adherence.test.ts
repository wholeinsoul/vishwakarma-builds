import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock db/queries ──────────────────────────────────────────────────────
const mockFindUserByPhone = vi.fn();
const mockFindUserById = vi.fn();
const mockFindPendingAdherenceLogs = vi.fn();
const mockUpdateAdherenceResponse = vi.fn();
const mockFindMissedReminders = vi.fn();
const mockFindMedicationById = vi.fn();
const mockFindCaretakerByUserId = vi.fn();
const mockMarkCaretakerAlerted = vi.fn();

vi.mock('../src/db/queries.js', () => ({
  findUserByPhone: (...args: unknown[]) => mockFindUserByPhone(...args),
  findUserById: (...args: unknown[]) => mockFindUserById(...args),
  findPendingAdherenceLogs: (...args: unknown[]) => mockFindPendingAdherenceLogs(...args),
  updateAdherenceResponse: (...args: unknown[]) => mockUpdateAdherenceResponse(...args),
  findMissedReminders: (...args: unknown[]) => mockFindMissedReminders(...args),
  findMedicationById: (...args: unknown[]) => mockFindMedicationById(...args),
  findCaretakerByUserId: (...args: unknown[]) => mockFindCaretakerByUserId(...args),
  markCaretakerAlerted: (...args: unknown[]) => mockMarkCaretakerAlerted(...args),
}));

import { recordResponse, checkMissedReminders } from '../src/services/adherence.js';

describe('Adherence Tracker', () => {
  const mockWhatsApp = {
    sendText: vi.fn().mockResolvedValue(undefined),
    sendImage: vi.fn().mockResolvedValue(undefined),
    sendTemplate: vi.fn().mockResolvedValue(undefined),
    markAsRead: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── recordResponse ──────────────────────────────────────────────────────

  describe('recordResponse', () => {
    it('records YES response and sends confirmation', async () => {
      mockFindUserByPhone.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockFindPendingAdherenceLogs.mockResolvedValue([{ id: 'log1' }]);
      mockUpdateAdherenceResponse.mockResolvedValue({ id: 'log1', response: 'yes' });

      await recordResponse('+919876543210', 'yes', mockWhatsApp);

      expect(mockUpdateAdherenceResponse).toHaveBeenCalledWith('log1', 'yes');
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('✅'),
      );
    });

    it('records NO response and sends reminder to take medication', async () => {
      mockFindUserByPhone.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockFindPendingAdherenceLogs.mockResolvedValue([{ id: 'log2' }]);
      mockUpdateAdherenceResponse.mockResolvedValue({ id: 'log2', response: 'no' });

      await recordResponse('+919876543210', 'no', mockWhatsApp);

      expect(mockUpdateAdherenceResponse).toHaveBeenCalledWith('log2', 'no');
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Please take your medication'),
      );
    });

    it('does nothing if user not found', async () => {
      mockFindUserByPhone.mockResolvedValue(null);

      await recordResponse('+919999999999', 'yes', mockWhatsApp);

      expect(mockFindPendingAdherenceLogs).not.toHaveBeenCalled();
      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
    });

    it('does nothing if no pending adherence logs', async () => {
      mockFindUserByPhone.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockFindPendingAdherenceLogs.mockResolvedValue([]);

      await recordResponse('+919876543210', 'yes', mockWhatsApp);

      expect(mockUpdateAdherenceResponse).not.toHaveBeenCalled();
      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
    });

    it('processes the most recent pending log (first in list)', async () => {
      mockFindUserByPhone.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockFindPendingAdherenceLogs.mockResolvedValue([
        { id: 'log_newest' },
        { id: 'log_older' },
      ]);
      mockUpdateAdherenceResponse.mockResolvedValue({ id: 'log_newest' });

      await recordResponse('+919876543210', 'yes', mockWhatsApp);

      expect(mockUpdateAdherenceResponse).toHaveBeenCalledWith('log_newest', 'yes');
    });
  });

  // ─── checkMissedReminders ───────────────────────────────────────────────

  describe('checkMissedReminders', () => {
    it('sends caretaker alert for missed reminder', async () => {
      const thirtyMinsAgo = new Date(Date.now() - 35 * 60 * 1000).toISOString();
      mockFindMissedReminders.mockResolvedValue([
        {
          id: 'log1',
          user_id: 'user1',
          medication_id: 'med1',
          reminder_sent_at: thirtyMinsAgo,
          response: null,
          caretaker_alerted: false,
        },
      ]);
      mockFindUserById.mockResolvedValue({ id: 'user1', phone: '+919876543210', name: 'Ramu Kaka' });
      mockFindMedicationById.mockResolvedValue({ id: 'med1', drug_name_en: 'Metformin' });
      mockFindCaretakerByUserId.mockResolvedValue({ id: 'ct1', phone: '+919876543211' });
      mockMarkCaretakerAlerted.mockResolvedValue({ id: 'log1' });

      await checkMissedReminders(mockWhatsApp);

      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543211',
        expect.stringContaining('Ramu Kaka'),
      );
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543211',
        expect.stringContaining('Metformin'),
      );
      expect(mockMarkCaretakerAlerted).toHaveBeenCalledWith('log1');
    });

    it('does nothing when no missed reminders', async () => {
      mockFindMissedReminders.mockResolvedValue([]);

      await checkMissedReminders(mockWhatsApp);

      expect(mockFindUserById).not.toHaveBeenCalled();
      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
    });

    it('skips when user is not found', async () => {
      mockFindMissedReminders.mockResolvedValue([
        { id: 'log1', user_id: 'missing_user', medication_id: 'med1', reminder_sent_at: new Date().toISOString() },
      ]);
      mockFindUserById.mockResolvedValue(null);

      await checkMissedReminders(mockWhatsApp);

      expect(mockFindMedicationById).not.toHaveBeenCalled();
      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
    });

    it('skips when medication is not found', async () => {
      mockFindMissedReminders.mockResolvedValue([
        { id: 'log1', user_id: 'user1', medication_id: 'missing_med', reminder_sent_at: new Date().toISOString() },
      ]);
      mockFindUserById.mockResolvedValue({ id: 'user1', phone: '+919876543210', name: 'Ramu' });
      mockFindMedicationById.mockResolvedValue(null);

      await checkMissedReminders(mockWhatsApp);

      expect(mockFindCaretakerByUserId).not.toHaveBeenCalled();
      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
    });

    it('skips when no caretaker is registered', async () => {
      mockFindMissedReminders.mockResolvedValue([
        { id: 'log1', user_id: 'user1', medication_id: 'med1', reminder_sent_at: new Date().toISOString() },
      ]);
      mockFindUserById.mockResolvedValue({ id: 'user1', phone: '+919876543210', name: 'Ramu' });
      mockFindMedicationById.mockResolvedValue({ id: 'med1', drug_name_en: 'Metformin' });
      mockFindCaretakerByUserId.mockResolvedValue(null);

      await checkMissedReminders(mockWhatsApp);

      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
      expect(mockMarkCaretakerAlerted).not.toHaveBeenCalled();
    });

    it('uses phone number when user has no name', async () => {
      mockFindMissedReminders.mockResolvedValue([
        { id: 'log1', user_id: 'user1', medication_id: 'med1', reminder_sent_at: new Date().toISOString() },
      ]);
      mockFindUserById.mockResolvedValue({ id: 'user1', phone: '+919876543210', name: null });
      mockFindMedicationById.mockResolvedValue({ id: 'med1', drug_name_en: 'Metformin' });
      mockFindCaretakerByUserId.mockResolvedValue({ id: 'ct1', phone: '+919876543211' });
      mockMarkCaretakerAlerted.mockResolvedValue({ id: 'log1' });

      await checkMissedReminders(mockWhatsApp);

      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543211',
        expect.stringContaining('+919876543210'),
      );
    });

    it('handles WhatsApp send failure without crashing', async () => {
      mockFindMissedReminders.mockResolvedValue([
        { id: 'log1', user_id: 'user1', medication_id: 'med1', reminder_sent_at: new Date().toISOString() },
      ]);
      mockFindUserById.mockResolvedValue({ id: 'user1', phone: '+919876543210', name: 'Ramu' });
      mockFindMedicationById.mockResolvedValue({ id: 'med1', drug_name_en: 'Metformin' });
      mockFindCaretakerByUserId.mockResolvedValue({ id: 'ct1', phone: '+919876543211' });
      mockWhatsApp.sendText.mockRejectedValueOnce(new Error('API error'));

      // Should not throw
      await checkMissedReminders(mockWhatsApp);

      expect(mockMarkCaretakerAlerted).not.toHaveBeenCalled();
    });

    it('processes multiple missed reminders', async () => {
      mockFindMissedReminders.mockResolvedValue([
        { id: 'log1', user_id: 'user1', medication_id: 'med1', reminder_sent_at: new Date().toISOString() },
        { id: 'log2', user_id: 'user2', medication_id: 'med2', reminder_sent_at: new Date().toISOString() },
      ]);
      mockFindUserById
        .mockResolvedValueOnce({ id: 'user1', phone: '+919876543210', name: 'Ramu' })
        .mockResolvedValueOnce({ id: 'user2', phone: '+919876543211', name: 'Sita' });
      mockFindMedicationById
        .mockResolvedValueOnce({ id: 'med1', drug_name_en: 'Metformin' })
        .mockResolvedValueOnce({ id: 'med2', drug_name_en: 'Amlodipine' });
      mockFindCaretakerByUserId
        .mockResolvedValueOnce({ id: 'ct1', phone: '+919000000001' })
        .mockResolvedValueOnce({ id: 'ct2', phone: '+919000000002' });
      mockMarkCaretakerAlerted.mockResolvedValue({});

      await checkMissedReminders(mockWhatsApp);

      expect(mockWhatsApp.sendText).toHaveBeenCalledTimes(2);
      expect(mockMarkCaretakerAlerted).toHaveBeenCalledTimes(2);
    });

    it('handles DB error gracefully', async () => {
      mockFindMissedReminders.mockRejectedValue(new Error('DB offline'));

      // Should not throw
      await checkMissedReminders(mockWhatsApp);
    });
  });
});
