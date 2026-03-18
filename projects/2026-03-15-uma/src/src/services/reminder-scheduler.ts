import cron from 'node-cron';
import * as db from '../db/queries.js';
import { WhatsAppClient } from './whatsapp-client.js';
import { messages } from '../utils/hindi.js';
import { checkMissedReminders } from './adherence.js';

let schedulerTask: cron.ScheduledTask | null = null;
let sharedWhatsAppClient: WhatsAppClient | null = null;

function getCurrentTimeInfo() {
  const now = new Date();
  const kolkata = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = kolkata.getHours().toString().padStart(2, '0');
  const minutes = kolkata.getMinutes().toString().padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;
  // JS getDay: 0=Sun, we need 1=Mon..7=Sun
  const jsDay = kolkata.getDay();
  const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;
  const currentDate = kolkata.toISOString().split('T')[0];
  return { currentTime, currentDayOfWeek, currentDate };
}

async function processReminders(): Promise<void> {
  try {
    const { currentTime, currentDayOfWeek, currentDate } = getCurrentTimeInfo();
    const dueReminders = await db.findDueReminders(currentTime, currentDayOfWeek, currentDate);
    if (dueReminders.length === 0) return;

    if (!sharedWhatsAppClient) {
      console.error('[Scheduler] WhatsApp client not initialized');
      return;
    }
    const whatsapp = sharedWhatsAppClient;

    for (const reminder of dueReminders) {
      const user = await db.findUserById(reminder.user_id);
      if (!user) continue;

      const medication = await db.findMedicationById(reminder.medication_id);
      if (!medication) continue;

      const text = messages.reminderMessage(
        medication.drug_name_hi || medication.drug_name_en,
        medication.drug_name_en,
        medication.dosage || '',
        medication.instructions || ''
      );

      try {
        await whatsapp.sendText(user.phone, text);

        await db.createAdherenceLog({
          user_id: user.id,
          medication_id: medication.id,
          schedule_id: reminder.id,
          reminder_sent_at: new Date().toISOString(),
        });

        // last_sent_at already updated atomically in findDueReminders
        console.log(`[Scheduler] Sent reminder to ${user.phone} for ${medication.drug_name_en}`);
      } catch (err) {
        console.error(`[Scheduler] Failed to send reminder to ${user.phone}:`, err);
      }
    }
  } catch (err) {
    console.error('[Scheduler] Error processing reminders:', err);
  }
}

export function startScheduler(whatsappClient: WhatsAppClient): void {
  if (schedulerTask) return;
  sharedWhatsAppClient = whatsappClient;

  // Check for due reminders every minute
  schedulerTask = cron.schedule('* * * * *', async () => {
    await processReminders();
    await checkMissedReminders(whatsappClient);
  });

  console.log('[Scheduler] Started — checking reminders every minute');
}

export function stopScheduler(): void {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log('[Scheduler] Stopped');
  }
}
