import { ConversationState, ConversationContext } from '../states.js';
import { WhatsAppClient } from '../../services/whatsapp-client.js';
import * as db from '../../db/queries.js';
import { readPrescription } from '../../services/prescription-reader.js';
import { validateMedication, getDrugHindiName } from '../../services/drug-validator.js';
import { messages, bilingual } from '../../utils/hindi.js';

export interface HandlerResult {
  newState: ConversationState;
  newContext: ConversationContext;
}

export async function handlePrescriptionImage(
  phone: string,
  imageUrl: string,
  context: ConversationContext,
  whatsapp: WhatsAppClient
): Promise<HandlerResult> {
  await whatsapp.sendText(phone, messages.processingPrescription);

  const user = await db.findUserByPhone(phone);
  if (!user) {
    await whatsapp.sendText(phone, messages.invalidInput);
    return { newState: ConversationState.AWAITING_PRESCRIPTION, newContext: context };
  }

  try {
    const result = await readPrescription(imageUrl);

    if (result.medications.length === 0) {
      await whatsapp.sendText(phone, messages.prescriptionError);
      return { newState: ConversationState.AWAITING_PRESCRIPTION, newContext: {} };
    }

    // Create prescription record
    const prescription = await db.createPrescription({
      user_id: user.id,
      image_url: imageUrl,
      ai_raw_response: { raw: result.raw_response },
      doctor_name: result.doctor_name || undefined,
      prescription_date: result.prescription_date || undefined,
    });

    const medicationIds: string[] = [];
    let warningMessages = '';

    for (const med of result.medications) {
      const validation = validateMedication(med.drug_name_en, med.dosage, med.frequency);
      const hindiName = getDrugHindiName(med.drug_name_en) || med.drug_name_hi || med.drug_name_en;

      const medication = await db.createMedication({
        prescription_id: prescription.id,
        user_id: user.id,
        drug_name_en: med.drug_name_en,
        drug_name_hi: hindiName,
        dosage: med.dosage,
        frequency: med.frequency,
        timing: med.timing || undefined,
        instructions: med.instructions,
        duration_days: med.duration_days ?? undefined,
        validated_against_db: validation.found,
      });

      medicationIds.push(medication.id);

      if (validation.warnings.length > 0) {
        warningMessages += validation.warnings.map((w) => `⚠️ ${w}`).join('\n') + '\n';
      }
    }

    if (warningMessages) {
      await whatsapp.sendText(phone, warningMessages.trim());
    }

    // Start confirmation flow with first medication
    const firstMed = await db.findMedicationById(medicationIds[0]);
    if (firstMed) {
      const confirmMsg = messages.confirmMedication(
        firstMed.drug_name_hi || firstMed.drug_name_en,
        firstMed.drug_name_en,
        firstMed.dosage || '',
        firstMed.frequency || ''
      );
      await whatsapp.sendText(phone, confirmMsg);
    }

    return {
      newState: ConversationState.CONFIRMING_MEDICATIONS,
      newContext: {
        prescription_id: prescription.id,
        medications_to_confirm: medicationIds,
        current_confirm_index: 0,
      },
    };
  } catch (err) {
    console.error('[Prescription] Error processing prescription:', err);
    await whatsapp.sendText(phone, messages.prescriptionError);
    return { newState: ConversationState.AWAITING_PRESCRIPTION, newContext: {} };
  }
}

export async function handleMedicationConfirmation(
  phone: string,
  messageText: string,
  context: ConversationContext,
  whatsapp: WhatsAppClient
): Promise<HandlerResult> {
  const answer = messageText.trim().toLowerCase();
  const isYes = ['yes', 'haan', 'ha', 'haa', 'हाँ', 'हां', 'ji', 'जी', 'y'].includes(answer);
  const isNo = ['no', 'nahi', 'naa', 'नहीं', 'na', 'n'].includes(answer);

  if (!isYes && !isNo) {
    await whatsapp.sendText(phone, messages.invalidInput);
    return { newState: ConversationState.CONFIRMING_MEDICATIONS, newContext: context };
  }

  const medIds = (context.medications_to_confirm || []) as string[];
  const currentIndex = (context.current_confirm_index || 0) as number;
  const currentMedId = medIds[currentIndex];

  if (isYes && currentMedId) {
    await db.confirmMedication(currentMedId);

    // Create schedule for this medication
    const medication = await db.findMedicationById(currentMedId);
    if (medication) {
      const user = await db.findUserByPhone(phone);
      const timings = medication.timing || ['08:00'];
      for (const time of timings) {
        await db.createSchedule({
          user_id: user!.id,
          medication_id: medication.id,
          reminder_time: time,
          start_date: new Date().toISOString().split('T')[0],
          end_date: medication.duration_days
            ? new Date(Date.now() + medication.duration_days * 86400000)
                .toISOString()
                .split('T')[0]
            : undefined,
        });
      }
    }
  } else if (isNo && currentMedId) {
    // Mark medication as inactive
    await db.deactivateMedication(currentMedId);
    const skippedMsg = bilingual(
      '❌ दवा हटा दी गई। अगली दवा देखते हैं।',
      '❌ Medication removed. Checking next one.'
    );
    await whatsapp.sendText(phone, skippedMsg);
  }

  const nextIndex = currentIndex + 1;

  if (nextIndex >= medIds.length) {
    // All medications processed
    await whatsapp.sendText(phone, messages.allConfirmed);
    await whatsapp.sendText(phone, messages.disclaimer);
    return {
      newState: ConversationState.AWAITING_PRESCRIPTION,
      newContext: {},
    };
  }

  // Confirm next medication
  const nextMed = await db.findMedicationById(medIds[nextIndex]);
  if (nextMed) {
    const confirmMsg = messages.confirmMedication(
      nextMed.drug_name_hi || nextMed.drug_name_en,
      nextMed.drug_name_en,
      nextMed.dosage || '',
      nextMed.frequency || ''
    );
    await whatsapp.sendText(phone, confirmMsg);
  }

  return {
    newState: ConversationState.CONFIRMING_MEDICATIONS,
    newContext: {
      ...context,
      current_confirm_index: nextIndex,
    },
  };
}
