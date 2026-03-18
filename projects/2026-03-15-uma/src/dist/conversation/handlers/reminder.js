import { ConversationState } from '../states.js';
import { recordResponse } from '../../services/adherence.js';
export async function handleReminderResponse(phone, messageText, context, _whatsapp) {
    const answer = messageText.trim().toLowerCase();
    const isYes = ['yes', 'haan', 'ha', 'haa', 'हाँ', 'हां', 'ji', 'जी', 'y', 'le li', 'ले ली'].includes(answer);
    const isNo = ['no', 'nahi', 'naa', 'नहीं', 'na', 'n', 'nahi li', 'नहीं ली'].includes(answer);
    if (isYes) {
        await recordResponse(phone, 'yes', _whatsapp);
    }
    else if (isNo) {
        await recordResponse(phone, 'no', _whatsapp);
    }
    // If neither yes nor no, ignore — they may be sending something else
    return {
        newState: ConversationState.AWAITING_PRESCRIPTION,
        newContext: {},
    };
}
//# sourceMappingURL=reminder.js.map