// Voice TTS stub — placeholder for MVP
// Will use Google Cloud TTS (gRPC) for Hindi voice generation

export async function generateVoiceReminder(
  _text: string,
  _language: string = 'hi-IN'
): Promise<Buffer | null> {
  // TODO: Implement Google Cloud TTS integration
  // 1. Call Google TTS API with Hindi voice (hi-IN-Wavenet-A)
  // 2. Get audio as LINEAR16
  // 3. Convert to OGG Opus for WhatsApp
  // 4. Return Buffer
  console.log('[Voice TTS] Stub — voice generation not yet implemented');
  return null;
}
