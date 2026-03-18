import { describe, it, expect } from 'vitest';
import { bilingual, bilingualInline, messages } from '../src/utils/hindi.js';

describe('Hindi Utils', () => {
  // ─── bilingual ────────────────────────────────────────────────────────

  describe('bilingual', () => {
    it('formats Hindi and English on separate lines', () => {
      const result = bilingual('नमस्ते', 'Hello');
      expect(result).toBe('नमस्ते\nHello');
    });

    it('preserves whitespace within each language', () => {
      const result = bilingual('एक दो तीन', 'one two three');
      expect(result).toBe('एक दो तीन\none two three');
    });

    it('handles empty strings', () => {
      const result = bilingual('', '');
      expect(result).toBe('\n');
    });
  });

  // ─── bilingualInline ──────────────────────────────────────────────────

  describe('bilingualInline', () => {
    it('formats Hindi with English in parentheses', () => {
      const result = bilingualInline('मेटफॉर्मिन', 'Metformin');
      expect(result).toBe('मेटफॉर्मिन (Metformin)');
    });

    it('handles empty strings', () => {
      const result = bilingualInline('', '');
      expect(result).toBe(' ()');
    });
  });

  // ─── Static message templates ─────────────────────────────────────────

  describe('messages', () => {
    it('welcome message contains Hindi and English', () => {
      expect(messages.welcome).toContain('नमस्ते');
      expect(messages.welcome).toContain('Welcome to Uma');
    });

    it('askName message is bilingual', () => {
      expect(messages.askName).toContain('कृपया अपना नाम बताएं');
      expect(messages.askName).toContain('Please tell us your name');
    });

    it('askPrescription message is bilingual', () => {
      expect(messages.askPrescription).toContain('प्रिस्क्रिप्शन');
      expect(messages.askPrescription).toContain('prescription');
    });

    it('processingPrescription message is bilingual', () => {
      expect(messages.processingPrescription).toContain('पढ़ी जा रही है');
      expect(messages.processingPrescription).toContain('Reading your prescription');
    });

    it('taken message contains checkmark and bilingual text', () => {
      expect(messages.taken).toContain('✅');
      expect(messages.taken).toContain('दवा ली गई');
      expect(messages.taken).toContain('Medication taken');
    });

    it('notTaken message is bilingual', () => {
      expect(messages.notTaken).toContain('कृपया जल्द से जल्द');
      expect(messages.notTaken).toContain('Please take your medication');
    });

    it('invalidInput message is bilingual', () => {
      expect(messages.invalidInput).toContain('समझ नहीं आया');
      expect(messages.invalidInput).toContain("I didn't understand");
    });

    it('prescriptionError message is bilingual', () => {
      expect(messages.prescriptionError).toContain('समस्या');
      expect(messages.prescriptionError).toContain('Could not read');
    });

    it('allConfirmed message contains checkmark and bilingual text', () => {
      expect(messages.allConfirmed).toContain('✅');
      expect(messages.allConfirmed).toContain('पुष्टि');
      expect(messages.allConfirmed).toContain('Reminders have been activated');
    });

    it('disclaimer message contains warning symbol and bilingual text', () => {
      expect(messages.disclaimer).toContain('⚠️');
      expect(messages.disclaimer).toContain('चिकित्सा सलाह नहीं');
      expect(messages.disclaimer).toContain('not medical advice');
    });
  });

  // ─── Dynamic message functions ────────────────────────────────────────

  describe('dynamic messages', () => {
    describe('confirmMedication', () => {
      it('includes drug names, dosage, and frequency', () => {
        const msg = messages.confirmMedication('मेटफॉर्मिन', 'Metformin', '500mg', 'twice daily');
        expect(msg).toContain('मेटफॉर्मिन');
        expect(msg).toContain('Metformin');
        expect(msg).toContain('500mg');
        expect(msg).toContain('twice daily');
      });

      it('asks for YES/NO confirmation', () => {
        const msg = messages.confirmMedication('x', 'X', '10mg', 'daily');
        expect(msg).toContain('YES');
        expect(msg).toContain('NO');
        expect(msg).toContain('हाँ');
        expect(msg).toContain('नहीं');
      });

      it('handles empty strings gracefully', () => {
        const msg = messages.confirmMedication('', '', '', '');
        expect(msg).toContain('YES');
        expect(msg).toContain('हाँ');
      });
    });

    describe('reminderMessage', () => {
      it('includes drug names, dosage, and instructions', () => {
        const msg = messages.reminderMessage('मेटफॉर्मिन', 'Metformin', '500mg', 'after food');
        expect(msg).toContain('मेटफॉर्मिन');
        expect(msg).toContain('Metformin');
        expect(msg).toContain('500mg');
        expect(msg).toContain('after food');
      });

      it('contains alarm emoji and YES/NO prompt', () => {
        const msg = messages.reminderMessage('x', 'X', '10mg', '');
        expect(msg).toContain('⏰');
        expect(msg).toContain('YES');
        expect(msg).toContain('NO');
      });
    });

    describe('caretakerAlert', () => {
      it('includes user name, drug name, and time', () => {
        const msg = messages.caretakerAlert('Ramu Kaka', 'Metformin', '08:30 AM');
        expect(msg).toContain('Ramu Kaka');
        expect(msg).toContain('Metformin');
        expect(msg).toContain('08:30 AM');
      });

      it('contains warning emoji', () => {
        const msg = messages.caretakerAlert('Test', 'Drug', '09:00');
        expect(msg).toContain('⚠️');
      });

      it('contains bilingual missed medication text', () => {
        const msg = messages.caretakerAlert('User', 'Drug', '10:00');
        expect(msg).toContain('दवा नहीं ली');
        expect(msg).toContain('missed medication');
      });
    });
  });
});
