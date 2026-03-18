import { ConversationState, ConversationContext } from '../states.js';
import { WhatsAppClient } from '../../services/whatsapp-client.js';
import * as db from '../../db/queries.js';
import { messages, bilingual } from '../../utils/hindi.js';
import { normalizeIndianPhone, isValidIndianPhone } from '../../utils/phone.js';

export interface HandlerResult {
  newState: ConversationState;
  newContext: ConversationContext;
}

export async function handleOnboardingWelcome(
  phone: string,
  _messageText: string,
  _context: ConversationContext,
  whatsapp: WhatsAppClient
): Promise<HandlerResult> {
  await whatsapp.sendText(phone, messages.welcome);
  await whatsapp.sendText(phone, messages.askName);

  return {
    newState: ConversationState.ONBOARDING_NAME,
    newContext: {},
  };
}

export async function handleOnboardingName(
  phone: string,
  messageText: string,
  context: ConversationContext,
  whatsapp: WhatsAppClient
): Promise<HandlerResult> {
  const name = messageText.trim();
  if (name.length < 2) {
    await whatsapp.sendText(phone, messages.invalidInput);
    return { newState: ConversationState.ONBOARDING_NAME, newContext: context };
  }

  await db.updateUserNameByPhone(phone, name);

  const caretakerPrompt = bilingual(
    `धन्यवाद, ${name}! क्या आपके परिवार का कोई सदस्य रिमाइंडर देखना चाहता है?\nहाँ या नहीं लिखें।`,
    `Thank you, ${name}! Does a family member want to monitor your reminders?\nReply YES or NO.`
  );
  await whatsapp.sendText(phone, caretakerPrompt);

  return {
    newState: ConversationState.ONBOARDING_CARETAKER,
    newContext: {},
  };
}

export async function handleOnboardingCaretaker(
  phone: string,
  messageText: string,
  context: ConversationContext,
  whatsapp: WhatsAppClient
): Promise<HandlerResult> {
  const answer = messageText.trim().toLowerCase();
  const isYes = ['yes', 'haan', 'ha', 'haa', 'हाँ', 'हां', 'ji', 'जी', 'y'].includes(answer);
  const isNo = ['no', 'nahi', 'naa', 'नहीं', 'na', 'n'].includes(answer);

  if (isYes) {
    const prompt = bilingual(
      'कृपया देखभाल करने वाले का फ़ोन नंबर भेजें (जैसे 9876543210)।',
      'Please send the caretaker\'s phone number (e.g. 9876543210).'
    );
    await whatsapp.sendText(phone, prompt);
    return {
      newState: ConversationState.ONBOARDING_CARETAKER_NAME,
      newContext: {},
    };
  }

  if (isNo) {
    await whatsapp.sendText(phone, messages.askPrescription);
    await db.updateUserStatusByPhone(phone, 'active');
    return {
      newState: ConversationState.AWAITING_PRESCRIPTION,
      newContext: {},
    };
  }

  await whatsapp.sendText(phone, messages.invalidInput);
  return { newState: ConversationState.ONBOARDING_CARETAKER, newContext: context };
}

export async function handleCaretakerName(
  phone: string,
  messageText: string,
  context: ConversationContext,
  whatsapp: WhatsAppClient
): Promise<HandlerResult> {
  const caretakerPhone = normalizeIndianPhone(messageText.trim());

  if (!isValidIndianPhone(caretakerPhone)) {
    const errorMsg = bilingual(
      'अमान्य फ़ोन नंबर। कृपया 10 अंकों का भारतीय मोबाइल नंबर भेजें।',
      'Invalid phone number. Please send a 10-digit Indian mobile number.'
    );
    await whatsapp.sendText(phone, errorMsg);
    return { newState: ConversationState.ONBOARDING_CARETAKER_NAME, newContext: context };
  }

  const user = await db.findUserByPhone(phone);
  if (user) {
    await db.createCaretaker({
      phone: caretakerPhone,
      user_id: user.id,
      relationship: 'family',
    });
  }

  const successMsg = bilingual(
    '✅ देखभालकर्ता जोड़ा गया।\nअब कृपया अपने प्रिस्क्रिप्शन की फोटो भेजें।',
    '✅ Caretaker added.\nNow please send a photo of your prescription.'
  );
  await whatsapp.sendText(phone, successMsg);
  await db.updateUserStatusByPhone(phone, 'active');

  return {
    newState: ConversationState.AWAITING_PRESCRIPTION,
    newContext: {},
  };
}
