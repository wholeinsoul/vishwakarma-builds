import { z } from "zod";

export const planInputSchema = z.object({
  theme: z.string().min(1, "Select a theme"),
  child_name: z.string().min(1, "Child's name is required").max(100),
  child_age: z.number().int().min(1, "Age must be between 1 and 18").max(18, "Age must be between 1 and 18"),
  title: z.string().min(1, "Party title is required").max(200),
  headcount: z.number().int().min(1, "At least 1 guest").max(100, "Maximum 100 guests"),
  budget: z.number().int().min(0).nullable().optional(),
  venue_type: z.enum(["backyard", "park", "indoor", "venue", "restaurant"]),
  party_date: z.string().nullable().optional(),
  dietary_notes: z.string().max(500).nullable().optional(),
});

export type PlanInput = z.infer<typeof planInputSchema>;

export const rsvpInputSchema = z.object({
  party_id: z.string().uuid("Invalid party"),
  guest_name: z.string().min(1, "Your name is required").max(100),
  guest_email: z.string().email("Invalid email").nullable().optional(),
  attending: z.enum(["yes", "no", "maybe"]),
  num_children: z.number().int().min(0).max(20).default(1),
  dietary_needs: z.string().max(500).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type RsvpInput = z.infer<typeof rsvpInputSchema>;

export const checkoutInputSchema = z.object({
  party_id: z.string().uuid("Invalid party"),
});
