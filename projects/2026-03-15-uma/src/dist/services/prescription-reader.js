import OpenAI from 'openai';
import { config } from '../config.js';
const SYSTEM_PROMPT = `You are a medical prescription reader for Indian prescriptions.
Extract medication details from the prescription image.

Return a JSON object with this exact structure:
{
  "doctor_name": "Dr. Name if visible",
  "prescription_date": "YYYY-MM-DD if visible",
  "medications": [
    {
      "drug_name_en": "Generic drug name in English",
      "dosage": "e.g. 500mg, 10mg",
      "frequency": "e.g. twice daily, once at night",
      "timing": ["08:00", "20:00"],
      "instructions": "e.g. after food, before meals, with water",
      "duration_days": 30
    }
  ]
}

Rules:
- Use generic drug names, not brand names (e.g. "Metformin" not "Glycomet")
- If brand name is visible, still use generic name
- Convert Hindi/regional drug names to English generic names
- For timing, use 24-hour format: morning=08:00, afternoon=14:00, evening=18:00, night=22:00
- If frequency is "OD" = once daily, "BD" = twice daily, "TDS" = thrice daily
- Common abbreviations: SOS=as needed, HS=at bedtime, AC=before food, PC=after food
- If duration not specified, leave duration_days as null
- Return ONLY valid JSON, no markdown formatting`;
export async function readPrescription(imageUrl) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Read this prescription and extract all medications.' },
                    { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
                ],
            },
        ],
        max_tokens: 2000,
        temperature: 0.1,
    });
    const rawText = response.choices[0]?.message?.content || '{}';
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    }
    catch {
        throw new Error(`Failed to parse GPT-4o response: ${rawText}`);
    }
    return {
        doctor_name: parsed.doctor_name,
        prescription_date: parsed.prescription_date,
        medications: parsed.medications || [],
        raw_response: rawText,
    };
}
//# sourceMappingURL=prescription-reader.js.map