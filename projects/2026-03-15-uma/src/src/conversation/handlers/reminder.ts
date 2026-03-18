import { ConversationState, ConversationContext } from '../states.js';
import { WhatsAppClient } from '../../services/whatsapp-client.js';
import { recordResponse } from '../../services/adherence.js';

export interface HandlerResult {
  newState: ConversationState;
  newContext: ConversationContext;
}

export async function handleReminderResponse(
  phone: string,
  messageText: string,
  context: ConversationContext,
  _whatsapp: WhatsAppClient
): Promise<HandlerResult> {
  const answer = messageText.trim().toLowerCase();
  const isYes = ['yes', 'haan', 'ha', 'haa', 'हाँ', 'हां', 'ji', 'जी', 'y', 'le li', 'ले ली'].includes(answer);
  const isNo = ['no', 'nahi', 'naa', 'नहीं', 'na', 'n', 'nahi li', 'नहीं ली'].includes(answer);

  if (isYes) {
    await recordResponse(phone, 'yes', _whatsapp);
  } else if (isNo) {
    await recordResponse(phone, 'no', _whatsapp);
  }
  // If neither yes nor no, ignore — they may be sending something else

  return {
    newState: ConversationState.AWAITING_PRESCRIPTION,
    newContext: {},
  };
}
