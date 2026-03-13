import { z } from 'zod';

export const reviewSchema = z.object({
  provider_id: z.string().uuid('Invalid provider ID'),
  author_name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long').trim(),
  author_city: z.string().max(100).optional(),
  rating: z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
  title: z.string().max(200).optional(),
  body: z.string().min(20, 'Review must be at least 20 characters').max(2000, 'Review too long').trim(),
  service_type: z.enum(['pumping', 'repair', 'installation', 'inspection']).optional(),
  service_date: z.string().optional(),
});

export const leadSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().max(100).optional(),
  source: z.enum(['checklist', 'newsletter', 'claim']).default('checklist'),
  county_slug: z.string().max(100).optional(),
});

export const claimSchema = z.object({
  provider_id: z.string().uuid('Invalid provider ID'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name required').max(100),
  phone: z.string().min(7, 'Phone required').max(20),
});

export const searchSchema = z.object({
  q: z.string().max(200).default(''),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
