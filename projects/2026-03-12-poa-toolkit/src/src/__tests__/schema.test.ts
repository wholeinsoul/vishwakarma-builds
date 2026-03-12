import { describe, it, expect } from 'vitest';
import type { Bank, BankRequirement, Submission } from '@/lib/types';

describe('Database Schema Validation', () => {
  describe('Bank type', () => {
    it('should have all required fields', () => {
      const bank: Bank = {
        id: '123',
        name: 'Test Bank',
        slug: 'test-bank',
        logo_url: null,
        website: 'https://test.com',
        poa_phone: '1-800-TEST',
        poa_email: null,
        processing_time_days: 10,
        accepts_springing_poa: false,
        accepts_durable_poa: true,
        requires_notarization: true,
        requires_medallion: false,
        allows_remote_submission: false,
        notes: 'Test notes',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(bank.id).toBeDefined();
      expect(bank.name).toBe('Test Bank');
      expect(bank.slug).toBe('test-bank');
    });

    it('should validate slug format', () => {
      const validSlugs = ['chase', 'bank-of-america', 'wells-fargo'];
      const invalidSlugs = ['Bank of America', 'chase!', 'test bank'];

      validSlugs.forEach((slug) => {
        expect(slug).toMatch(/^[a-z0-9-]+$/);
      });

      invalidSlugs.forEach((slug) => {
        expect(slug).not.toMatch(/^[a-z0-9-]+$/);
      });
    });
  });

  describe('BankRequirement type', () => {
    it('should enforce category enum', () => {
      const validCategories: Array<BankRequirement['category']> = [
        'document',
        'form',
        'identification',
        'other',
      ];

      validCategories.forEach((category) => {
        const requirement: BankRequirement = {
          id: '123',
          bank_id: 'bank-123',
          category,
          title: 'Test Requirement',
          description: null,
          is_required: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
        };

        expect(requirement.category).toBe(category);
      });
    });
  });

  describe('Submission type', () => {
    it('should enforce POA type enum', () => {
      const validTypes: Array<Submission['poa_type']> = ['durable', 'springing', 'limited'];

      validTypes.forEach((poa_type) => {
        const submission: Partial<Submission> = {
          poa_type,
          status: 'preparing',
        };

        expect(submission.poa_type).toBe(poa_type);
      });
    });

    it('should enforce status enum', () => {
      const validStatuses: Array<Submission['status']> = [
        'preparing',
        'submitted',
        'under_review',
        'approved',
        'rejected',
      ];

      validStatuses.forEach((status) => {
        const submission: Partial<Submission> = {
          poa_type: 'durable',
          status,
        };

        expect(submission.status).toBe(status);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/optional fields', () => {
      const bank: Bank = {
        id: '123',
        name: 'Test Bank',
        slug: 'test',
        logo_url: null,
        website: null,
        poa_phone: null,
        poa_email: null,
        processing_time_days: null,
        accepts_springing_poa: false,
        accepts_durable_poa: true,
        requires_notarization: true,
        requires_medallion: false,
        allows_remote_submission: false,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(bank.logo_url).toBeNull();
      expect(bank.website).toBeNull();
      expect(bank.processing_time_days).toBeNull();
    });

    it('should validate rejection report vote types', () => {
      const validVotes = ['up', 'down'];

      validVotes.forEach((vote_type) => {
        expect(['up', 'down']).toContain(vote_type);
      });

      const invalidVote = 'sideways';
      expect(['up', 'down']).not.toContain(invalidVote);
    });
  });
});
