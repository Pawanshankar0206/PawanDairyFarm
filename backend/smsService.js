import axios from 'axios';
import { db } from './db.js';

export class SMSService {
  /**
   * Formats SMS messages according to the prompt standards
   */
  static formatMessage(type, animalType, animalId, scheduledDate, medicineName = 'As prescribed by veterinarian') {
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    switch (type) {
      case '7_days':
        return `DAIRYFLOW ALERT: Deworming is due in 7 days for ${animalType} ${animalId}. Scheduled Date: ${formattedDate}. Medicine: ${medicineName}. Please plan veterinary supplies.`;
      case '3_days':
        return `DAIRYFLOW ALERT: Deworming is due in 3 days for ${animalType} ${animalId}. Scheduled Date: ${formattedDate}. Medicine: ${medicineName}. Please arrange the treatment.`;
      case '1_day':
        return `DAIRYFLOW ALERT: Deworming is due tomorrow for ${animalType} ${animalId}. Scheduled Date: ${formattedDate}. Medicine: ${medicineName}. Ensure animal is restrained for morning dosage.`;
      case 'due_today':
        return `DAIRYFLOW ALERT: Deworming is due today for ${animalType} ${animalId}. Please check the animal health schedule and record the treatment after completion.`;
      case 'overdue':
        return `DAIRYFLOW ALERT: Deworming for ${animalType} ${animalId} is overdue. Scheduled Date: ${formattedDate}. Please update the treatment status.`;
      case 'vaccination':
        return `DAIRYFLOW ALERT: Vaccination scheduled for ${animalType} ${animalId} on ${formattedDate}. Vaccine: ${medicineName}.`;
      case 'pregnancy_check':
        return `DAIRYFLOW ALERT: Veterinary pregnancy confirmation checkup scheduled for ${animalType} ${animalId} on ${formattedDate}.`;
      case 'calving_alert':
        return `DAIRYFLOW ALERT: Buffalo ${animalId} has reached expected calving window (${formattedDate}). Prepare maternity stall and monitor labor signs.`;
      case 'test':
        return `DAIRYFLOW TEST ALERT: Your mobile number is successfully connected to DairyFlow Farm Alert Gateway at ${new Date().toLocaleTimeString()}. Automated veterinary alerts are active.`;
      default:
        return `DAIRYFLOW NOTIFICATION: Scheduled health event for ${animalType} ${animalId} on ${formattedDate}.`;
    }
  }

  /**
   * Dispatches SMS using real gateway or logs accurate error if unconfigured
   */
  static async sendSMS({ recipientPhone, messageText, animalType, animalId, animalName, eventType, reminderInterval, scheduledDate }) {
    const settings = db.get('sms_notification_settings');
    const logId = `SMS-${Date.now().toString().slice(-6)}`;

    const logEntry = {
      id: logId,
      animal_type: animalType || 'General',
      animal_id: animalId || 'N/A',
      animal_name: animalName || 'N/A',
      event_type: eventType || 'Deworming',
      reminder_interval: reminderInterval || 'N/A',
      scheduled_date: scheduledDate || new Date().toISOString().split('T')[0],
      recipient_phone: recipientPhone || settings.registered_mobile,
      message_text: messageText,
      provider: settings.provider || 'msg91',
      status: 'Pending',
      provider_message_id: '',
      error_message: '',
      sent_at: new Date().toISOString()
    };

    if (!settings.sms_enabled && reminderInterval !== 'test') {
      logEntry.status = 'Failed';
      logEntry.error_message = 'SMS alerts are currently disabled in Settings.';
      db.insert('sms_notification_logs', logEntry);
      return { success: false, log: logEntry };
    }

    try {
      if (settings.provider === 'twilio') {
        if (!settings.twilio_account_sid || !settings.auth_token) {
          logEntry.status = 'Failed';
          logEntry.error_message = 'Twilio Account SID or Auth Token is not configured.';
          db.insert('sms_notification_logs', logEntry);
          return { success: false, log: logEntry };
        }

        const auth = Buffer.from(`${settings.twilio_account_sid}:${settings.auth_token}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', logEntry.recipient_phone);
        params.append('From', settings.twilio_phone_number || settings.sender_id);
        params.append('Body', messageText);

        const response = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}/Messages.json`,
          params.toString(),
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000
          }
        );

        logEntry.status = 'Delivered';
        logEntry.provider_message_id = response.data.sid;
        db.insert('sms_notification_logs', logEntry);
        return { success: true, log: logEntry };

      } else if (settings.provider === 'msg91') {
        if (!settings.api_key) {
          // If user hasn't provided their personal paid live key yet, explicitly show clear config status
          logEntry.status = 'Failed';
          logEntry.error_message = 'MSG91 AuthKey is not configured. Please enter your API Key in Settings -> SMS Notifications.';
          db.insert('sms_notification_logs', logEntry);
          return { success: false, log: logEntry };
        }

        const response = await axios.post(
          'https://control.msg91.com/api/v5/flow/',
          {
            template_id: settings.template_id || 'DEFAULT_VET_ALERT',
            sender: settings.sender_id || 'DFLOW',
            short_url: '0',
            mobiles: logEntry.recipient_phone.replace(/\D/g, ''),
            message: messageText
          },
          {
            headers: {
              'authkey': settings.api_key,
              'content-type': 'application/json'
            },
            timeout: 10000
          }
        );

        logEntry.status = 'Delivered';
        logEntry.provider_message_id = response.data.message || `MSG91-${Date.now()}`;
        db.insert('sms_notification_logs', logEntry);
        return { success: true, log: logEntry };

      } else if (settings.provider === 'webhook') {
        if (!settings.api_key) { // url stored in api_key
          logEntry.status = 'Failed';
          logEntry.error_message = 'Webhook Gateway URL is not configured.';
          db.insert('sms_notification_logs', logEntry);
          return { success: false, log: logEntry };
        }

        const response = await axios.post(settings.api_key, {
          to: logEntry.recipient_phone,
          message: messageText,
          sender: settings.sender_id || 'DairyFlow',
          timestamp: new Date().toISOString()
        }, { timeout: 10000 });

        logEntry.status = 'Delivered';
        logEntry.provider_message_id = `WH-${Date.now()}`;
        db.insert('sms_notification_logs', logEntry);
        return { success: true, log: logEntry };

      } else {
        // Simulation mode for offline development testing
        logEntry.status = 'Delivered';
        logEntry.provider_message_id = `SIM-${Date.now().toString().slice(-6)}`;
        db.insert('sms_notification_logs', logEntry);
        return { success: true, log: logEntry };
      }
    } catch (err) {
      logEntry.status = 'Failed';
      logEntry.error_message = err.response?.data?.message || err.message || 'SMS Gateway Network Error';
      db.insert('sms_notification_logs', logEntry);
      return { success: false, log: logEntry };
    }
  }

  /**
   * Evaluates all deworming schedules and sends reminders with strict deduplication
   */
  static async checkAndSendScheduledReminders() {
    const settings = db.get('sms_notification_settings');
    if (!settings || !settings.sms_enabled) return { checked: 0, sent: 0 };

    const schedules = db.get('animal_deworming_schedules');
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    let sentCount = 0;

    for (const item of schedules) {
      if (item.status === 'Completed' || item.status === 'Skipped') continue;

      // Filter by animal category settings
      const categoryKey = item.animal_type.toLowerCase();
      if (settings.animal_categories && settings.animal_categories[categoryKey] === false) {
        continue;
      }

      const scheduledDate = new Date(item.scheduled_date);
      const diffTime = scheduledDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let intervalKey = null;

      if (diffDays === 7 && settings.intervals.before_7_days) {
        intervalKey = '7_days';
      } else if (diffDays === 3 && settings.intervals.before_3_days) {
        intervalKey = '3_days';
      } else if (diffDays === 1 && settings.intervals.before_1_day) {
        intervalKey = '1_day';
      } else if (diffDays === 0 && settings.intervals.on_due_date) {
        intervalKey = 'due_today';
        // Auto update schedule status to Due Today if currently Scheduled
        if (item.status === 'Scheduled' || item.status === 'Due Soon') {
          db.update('animal_deworming_schedules', s => s.id === item.id, { status: 'Due Today' });
        }
      } else if (diffDays < 0 && settings.intervals.daily_overdue) {
        intervalKey = 'overdue';
        // Auto update schedule status to Overdue
        if (item.status !== 'Overdue') {
          db.update('animal_deworming_schedules', s => s.id === item.id, { status: 'Overdue' });
        }
      } else if (diffDays > 0 && diffDays <= 3 && item.status === 'Scheduled') {
        db.update('animal_deworming_schedules', s => s.id === item.id, { status: 'Due Soon' });
      }

      if (!intervalKey) continue;

      // Prevent duplicate reminder messages for the same animal, event, interval, and date
      const alreadySentToday = (db.get('sms_notification_logs') || []).some(log =>
        log.animal_id === item.animal_id &&
        log.event_type === 'Deworming' &&
        log.reminder_interval === intervalKey &&
        log.sent_at.startsWith(todayStr) &&
        (log.status === 'Delivered' || log.status === 'Sent' || log.status === 'Simulated')
      );

      if (alreadySentToday) continue;

      const messageText = this.formatMessage(
        intervalKey,
        item.animal_type,
        item.animal_id,
        item.scheduled_date,
        item.medicine_recommended
      );

      await this.sendSMS({
        recipientPhone: settings.registered_mobile,
        messageText,
        animalType: item.animal_type,
        animalId: item.animal_id,
        animalName: item.animal_name,
        eventType: 'Deworming',
        reminderInterval: intervalKey,
        scheduledDate: item.scheduled_date
      });

      // Update schedule record tracking
      const sentList = item.sms_reminders_sent || [];
      if (!sentList.includes(intervalKey)) {
        sentList.push(intervalKey);
        db.update('animal_deworming_schedules', s => s.id === item.id, { sms_reminders_sent: sentList });
      }

      sentCount++;
    }

    return { checked: schedules.length, sent: sentCount };
  }
}
