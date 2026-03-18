import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock db/queries ──────────────────────────────────────────────────────
const mockFindDueReminders = vi.fn();
const mockFindUserById = vi.fn();
const mockFindMedicationById = vi.fn();
const mockCreateAdherenceLog = vi.fn();

vi.mock('../src/db/queries.js', () => ({
  findDueReminders: (...args: unknown[]) => mockFindDueReminders(...args),
  findUserById: (...args: unknown[]) => mockFindUserById(...args),
  findMedicationById: (...args: unknown[]) => mockFindMedicationById(...args),
  createAdherenceLog: (...args: unknown[]) => mockCreateAdherenceLog(...args),
}));

// ─── Mock adherence ───────────────────────────────────────────────────────
const mockCheckMissedReminders = vi.fn().mockResolvedValue(undefined);
vi.mock('../src/services/adherence.js', () => ({
  checkMissedReminders: (...args: unknown[]) => mockCheckMissedReminders(...args),
}));

// ─── Mock node-cron ───────────────────────────────────────────────────────
let cronCallback: (() => Promise<void>) | null = null;
const mockStop = vi.fn();
vi.mock('node-cron', () => ({
  default: {
    schedule: (_expr: string, cb: () => Promise<void>) => {
      cronCallback = cb;
      return { stop: mockStop };
    },
  },
}));

import { startScheduler, stopScheduler } from '../src/services/reminder-scheduler.js';

describe('Reminder Scheduler', () => {
  const mockWhatsApp = {
    sendText: vi.fn().mockResolvedValue(undefined),
    sendImage: vi.fn().mockResolvedValue(undefined),
    sendTemplate: vi.fn().mockResolvedValue(undefined),
    markAsRead: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cronCallback = null;
    // Reset module-level state by stopping any existing scheduler
    stopScheduler();
  });

  afterEach(() => {
    stopScheduler();
  });

  describe('startScheduler', () => {
    it('starts cron and registers callback', () => {
      startScheduler(mockWhatsApp);
      expect(cronCallback).toBeTypeOf('function');
    });

    it('does not start twice if already running', () => {
      startScheduler(mockWhatsApp);
      const firstCb = cronCallback;
      startScheduler(mockWhatsApp);
      // cronCallback remains from first call since the second returns early
      expect(cronCallback).toBe(firstCb);
    });
  });

  describe('stopScheduler', () => {
    it('stops the cron task', () => {
      startScheduler(mockWhatsApp);
      stopScheduler();
      expect(mockStop).toHaveBeenCalled();
    });

    it('does nothing if not started', () => {
      // Should not throw
      stopScheduler();
      expect(mockStop).not.toHaveBeenCalled();
    });
  });

  describe('processReminders (via cron tick)', () => {
    it('sends reminders for due schedules', async () => {
      mockFindDueReminders.mockResolvedValue([
        { id: 'sched1', user_id: 'user1', medication_id: 'med1' },
      ]);
      mockFindUserById.mockResolvedValue({ id: 'user1', phone: '+919876543210', name: 'Ramu' });
      mockFindMedicationById.mockResolvedValue({
        id: 'med1',
        drug_name_en: 'Metformin',
        drug_name_hi: 'मेटफॉर्मिन',
        dosage: '500mg',
        instructions: 'after food',
      });
      mockCreateAdherenceLog.mockResolvedValue({ id: 'log1' });

      startScheduler(mockWhatsApp);
      await cronCallback!();

      expect(mockFindDueReminders).toHaveBeenCalled();
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Metformin'),
      );
      expect(mockCreateAdherenceLog).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user1',
          medication_id: 'med1',
          schedule_id: 'sched1',
        }),
      );
    });

    it('does nothing when no reminders are due', async () => {
      mockFindDueReminders.mockResolvedValue([]);

      startScheduler(mockWhatsApp);
      await cronCallback!();

      expect(mockFindUserById).not.toHaveBeenCalled();
      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
    });

    it('skips reminder when user is not found', async () => {
      mockFindDueReminders.mockResolvedValue([
        { id: 'sched1', user_id: 'missing_user', medication_id: 'med1' },
      ]);
      mockFindUserById.mockResolvedValue(null);

      startScheduler(mockWhatsApp);
      await cronCallback!();

      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
    });

    it('skips reminder when medication is not found', async () => {
      mockFindDueReminders.mockResolvedValue([
        { id: 'sched1', user_id: 'user1', medication_id: 'missing_med' },
      ]);
      mockFindUserById.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockFindMedicationById.mockResolvedValue(null);

      startScheduler(mockWhatsApp);
      await cronCallback!();

      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
    });

    it('handles WhatsApp send failure without crashing', async () => {
      mockFindDueReminders.mockResolvedValue([
        { id: 'sched1', user_id: 'user1', medication_id: 'med1' },
      ]);
      mockFindUserById.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockFindMedicationById.mockResolvedValue({
        id: 'med1',
        drug_name_en: 'Metformin',
        drug_name_hi: 'मेटफॉर्मिन',
        dosage: '500mg',
        instructions: 'after food',
      });
      mockWhatsApp.sendText.mockRejectedValueOnce(new Error('WhatsApp API down'));

      startScheduler(mockWhatsApp);
      // Should not throw
      await cronCallback!();

      expect(mockCreateAdherenceLog).not.toHaveBeenCalled();
    });

    it('processes multiple reminders in sequence', async () => {
      mockFindDueReminders.mockResolvedValue([
        { id: 'sched1', user_id: 'user1', medication_id: 'med1' },
        { id: 'sched2', user_id: 'user2', medication_id: 'med2' },
      ]);
      mockFindUserById
        .mockResolvedValueOnce({ id: 'user1', phone: '+919876543210' })
        .mockResolvedValueOnce({ id: 'user2', phone: '+919876543211' });
      mockFindMedicationById
        .mockResolvedValueOnce({ id: 'med1', drug_name_en: 'Metformin', drug_name_hi: null, dosage: '500mg', instructions: '' })
        .mockResolvedValueOnce({ id: 'med2', drug_name_en: 'Amlodipine', drug_name_hi: null, dosage: '5mg', instructions: '' });
      mockCreateAdherenceLog.mockResolvedValue({ id: 'log1' });

      startScheduler(mockWhatsApp);
      await cronCallback!();

      expect(mockWhatsApp.sendText).toHaveBeenCalledTimes(2);
      expect(mockCreateAdherenceLog).toHaveBeenCalledTimes(2);
    });

    it('calls checkMissedReminders after processing', async () => {
      mockFindDueReminders.mockResolvedValue([]);

      startScheduler(mockWhatsApp);
      await cronCallback!();

      expect(mockCheckMissedReminders).toHaveBeenCalledWith(mockWhatsApp);
    });

    it('uses Hindi drug name when available, falls back to English', async () => {
      mockFindDueReminders.mockResolvedValue([
        { id: 'sched1', user_id: 'user1', medication_id: 'med1' },
      ]);
      mockFindUserById.mockResolvedValue({ id: 'user1', phone: '+919876543210' });
      mockFindMedicationById.mockResolvedValue({
        id: 'med1',
        drug_name_en: 'Metformin',
        drug_name_hi: null,
        dosage: '500mg',
        instructions: '',
      });
      mockCreateAdherenceLog.mockResolvedValue({ id: 'log1' });

      startScheduler(mockWhatsApp);
      await cronCallback!();

      // When drug_name_hi is null, should use drug_name_en as fallback
      expect(mockWhatsApp.sendText).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringContaining('Metformin'),
      );
    });

    it('handles findDueReminders error gracefully', async () => {
      mockFindDueReminders.mockRejectedValue(new Error('DB connection lost'));

      startScheduler(mockWhatsApp);
      // Should not throw
      await cronCallback!();

      expect(mockWhatsApp.sendText).not.toHaveBeenCalled();
    });
  });
});
