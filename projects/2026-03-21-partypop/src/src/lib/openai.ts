import OpenAI from "openai";
import type { PlanData } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GeneratePlanInput {
  theme: string;
  prompt_context: string;
  child_name: string;
  child_age: number;
  headcount: number;
  budget: number | null;
  venue_type: string;
  dietary_notes: string | null;
}

const SYSTEM_PROMPT = `You are Partypop, an AI party planner for kids' birthdays.
Generate a complete party plan in JSON format.
Return ONLY valid JSON with no markdown formatting, no code blocks, just the raw JSON object.

The JSON must have this exact structure:
{
  "party_title": "string",
  "timeline": [
    { "time": "2:00 PM", "duration_min": 15, "activity": "string", "description": "string", "supplies_needed": ["string"] }
  ],
  "activities": [
    { "name": "string", "description": "string", "age_appropriate": true, "duration_min": 15, "supplies": ["string"], "instructions": "string" }
  ],
  "food_menu": [
    { "item": "string", "quantity": "string", "notes": "string" }
  ],
  "decorations": [
    { "item": "string", "quantity": 1, "estimated_cost": 5.00 }
  ],
  "shopping_list": [
    { "item": "string", "quantity": "string", "category": "food|decoration|activity|supplies", "estimated_cost": 5.00 }
  ],
  "tips": ["string"],
  "estimated_total": 150.00
}`;

export async function generatePartyPlan(input: GeneratePlanInput): Promise<PlanData> {
  const budgetText = input.budget
    ? `$${(input.budget / 100).toFixed(0)}`
    : "flexible (suggest reasonable options)";

  const userPrompt = `Plan a birthday party with these details:

${input.prompt_context}

Child's name: ${input.child_name}
Age: ${input.child_age}
Number of guests: ${input.headcount} kids (plus parents)
Budget: ${budgetText}
Venue: ${input.venue_type}
${input.dietary_notes ? `Dietary notes: ${input.dietary_notes}` : "No special dietary needs"}

Create a fun, age-appropriate party plan. Include 4-6 activities, a complete food menu for the guests, a decoration list, and a consolidated shopping list with estimated costs. Make the timeline realistic and include setup and cleanup time.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from AI");
  }

  const parsed = JSON.parse(content) as PlanData;

  // Ensure all required fields exist with defaults
  return {
    party_title: parsed.party_title || `${input.child_name}'s ${input.theme} Party`,
    timeline: parsed.timeline || [],
    activities: parsed.activities || [],
    food_menu: parsed.food_menu || [],
    decorations: parsed.decorations || [],
    shopping_list: parsed.shopping_list || [],
    tips: parsed.tips || [],
    estimated_total: parsed.estimated_total || 0,
  };
}
