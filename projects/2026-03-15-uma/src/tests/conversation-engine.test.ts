import { describe, it, expect } from 'vitest';
import { ConversationState, isValidTransition, VALID_TRANSITIONS } from '../src/conversation/states.js';

describe('Conversation State Machine', () => {
  describe('ConversationState enum', () => {
    it('has all required states', () => {
      expect(ConversationState.IDLE).toBe('idle');
      expect(ConversationState.ONBOARDING_WELCOME).toBe('onboarding_welcome');
      expect(ConversationState.ONBOARDING_NAME).toBe('onboarding_name');
      expect(ConversationState.ONBOARDING_CARETAKER).toBe('onboarding_caretaker');
      expect(ConversationState.ONBOARDING_CARETAKER_NAME).toBe('onboarding_caretaker_name');
      expect(ConversationState.AWAITING_PRESCRIPTION).toBe('awaiting_prescription');
      expect(ConversationState.PROCESSING_PRESCRIPTION).toBe('processing_prescription');
      expect(ConversationState.CONFIRMING_MEDICATIONS).toBe('confirming_medications');
      expect(ConversationState.AWAITING_REMINDER_RESPONSE).toBe('awaiting_reminder_response');
    });
  });

  describe('isValidTransition', () => {
    it('allows IDLE → ONBOARDING_WELCOME', () => {
      expect(isValidTransition(ConversationState.IDLE, ConversationState.ONBOARDING_WELCOME)).toBe(true);
    });

    it('allows ONBOARDING_NAME → ONBOARDING_CARETAKER', () => {
      expect(isValidTransition(ConversationState.ONBOARDING_NAME, ConversationState.ONBOARDING_CARETAKER)).toBe(true);
    });

    it('allows ONBOARDING_CARETAKER → AWAITING_PRESCRIPTION (no caretaker)', () => {
      expect(isValidTransition(ConversationState.ONBOARDING_CARETAKER, ConversationState.AWAITING_PRESCRIPTION)).toBe(true);
    });

    it('allows ONBOARDING_CARETAKER → ONBOARDING_CARETAKER_NAME (has caretaker)', () => {
      expect(isValidTransition(ConversationState.ONBOARDING_CARETAKER, ConversationState.ONBOARDING_CARETAKER_NAME)).toBe(true);
    });

    it('allows AWAITING_PRESCRIPTION → PROCESSING_PRESCRIPTION', () => {
      expect(isValidTransition(ConversationState.AWAITING_PRESCRIPTION, ConversationState.PROCESSING_PRESCRIPTION)).toBe(true);
    });

    it('allows PROCESSING_PRESCRIPTION → CONFIRMING_MEDICATIONS', () => {
      expect(isValidTransition(ConversationState.PROCESSING_PRESCRIPTION, ConversationState.CONFIRMING_MEDICATIONS)).toBe(true);
    });

    it('allows CONFIRMING_MEDICATIONS → CONFIRMING_MEDICATIONS (next med)', () => {
      expect(isValidTransition(ConversationState.CONFIRMING_MEDICATIONS, ConversationState.CONFIRMING_MEDICATIONS)).toBe(true);
    });

    it('allows CONFIRMING_MEDICATIONS → AWAITING_PRESCRIPTION (all done)', () => {
      expect(isValidTransition(ConversationState.CONFIRMING_MEDICATIONS, ConversationState.AWAITING_PRESCRIPTION)).toBe(true);
    });

    it('disallows invalid transition IDLE → CONFIRMING_MEDICATIONS', () => {
      expect(isValidTransition(ConversationState.IDLE, ConversationState.CONFIRMING_MEDICATIONS)).toBe(false);
    });

    it('disallows invalid transition ONBOARDING_NAME → IDLE', () => {
      expect(isValidTransition(ConversationState.ONBOARDING_NAME, ConversationState.IDLE)).toBe(false);
    });
  });

  describe('VALID_TRANSITIONS', () => {
    it('contains onboarding flow transitions', () => {
      const onboardingTransitions = VALID_TRANSITIONS.filter(
        (t) => t.from.startsWith('onboarding') || t.to.startsWith('onboarding')
      );
      expect(onboardingTransitions.length).toBeGreaterThan(0);
    });

    it('contains prescription flow transitions', () => {
      const prescriptionTransitions = VALID_TRANSITIONS.filter(
        (t) =>
          t.from === ConversationState.AWAITING_PRESCRIPTION ||
          t.to === ConversationState.PROCESSING_PRESCRIPTION ||
          t.from === ConversationState.PROCESSING_PRESCRIPTION
      );
      expect(prescriptionTransitions.length).toBeGreaterThan(0);
    });

    it('contains error recovery transition', () => {
      const errorRecovery = VALID_TRANSITIONS.find(
        (t) =>
          t.from === ConversationState.PROCESSING_PRESCRIPTION &&
          t.to === ConversationState.AWAITING_PRESCRIPTION
      );
      expect(errorRecovery).toBeDefined();
      expect(errorRecovery!.trigger).toBe('error');
    });
  });
});
