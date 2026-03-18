import * as db from '../db/queries.js';
import { messages } from '../utils/hindi.js';
export async function recordResponse(phone, response, whatsapp) {
    const user = await db.findUserByPhone(phone);
    if (!user)
        return;
    // Find the most recent pending adherence log for this user
    const pendingLogs = await db.findPendingAdherenceLogs(user.id);
    if (pendingLogs.length === 0)
        return;
    const latestLog = pendingLogs[0];
    await db.updateAdherenceResponse(latestLog.id, response);
    if (response === 'yes') {
        await whatsapp.sendText(phone, messages.taken);
    }
    else {
        await whatsapp.sendText(phone, messages.notTaken);
    }
}
export async function checkMissedReminders(whatsapp) {
    try {
        const missed = await db.findMissedReminders();
        if (missed.length === 0)
            return;
        for (const log of missed) {
            const user = await db.findUserById(log.user_id);
            if (!user)
                continue;
            const medication = await db.findMedicationById(log.medication_id);
            if (!medication)
                continue;
            const caretaker = await db.findCaretakerByUserId(user.id);
            if (!caretaker)
                continue;
            const sentTime = new Date(log.reminder_sent_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kolkata',
            });
            const alertText = messages.caretakerAlert(user.name || user.phone, medication.drug_name_en, sentTime);
            try {
                await whatsapp.sendText(caretaker.phone, alertText);
                await db.markCaretakerAlerted(log.id);
                console.log(`[Adherence] Alerted caretaker ${caretaker.phone} about ${user.phone}`);
            }
            catch (err) {
                console.error(`[Adherence] Failed to alert caretaker ${caretaker.phone}:`, err);
            }
        }
    }
    catch (err) {
        console.error('[Adherence] Error checking missed reminders:', err);
    }
}
//# sourceMappingURL=adherence.js.map