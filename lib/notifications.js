import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Local scheduled reminders. These fire in Expo Go on both platforms (only
// remote push on Android needs a dev build), so everything here is testable now.
//
// Model: syncNotifications() is idempotent — it cancels everything and reschedules
// from the current tasks/habits/settings. Call it whenever that data changes.

let handlerConfigured = false;

export function configureNotifications() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

export async function getPermissionGranted() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// Prompts for permission if not already granted. Returns whether granted.
export async function ensurePermissions() {
  configureNotifications();
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return req.status === 'granted';
}

// "HH:MM" (24h) or "h:MM AM/PM" → { hour, minute } | null
function parseHM(str) {
  if (!str) return null;
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(str.trim());
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && hour < 12) hour += 12;
  if (ap === 'AM' && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export async function sendTestNotification() {
  const granted = await ensurePermissions();
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'TaskFlow', body: "Notifications are working — you're all set." },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
  });
  return true;
}

// Cancels all scheduled notifications and reschedules from current state.
export async function syncNotifications({ tasks = [], habits = [], settings }) {
  configureNotifications();
  const granted = await getPermissionGranted();

  // Always clear first so toggling off / removing items takes effect.
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    return;
  }

  if (!granted || !settings || settings.enabled === false) return;
  await ensureAndroidChannel();

  const now = Date.now();
  const defaultHM = parseHM(settings.defaultReminderTime) ?? { hour: 8, minute: 0 };
  const jobs = [];

  // Task reminders — one-off on the due date, at the task's time or the default.
  if (settings.taskReminders) {
    for (const t of tasks) {
      if (!t?.dueDate || t.completed) continue;
      const [y, mo, d] = t.dueDate.split('-').map(Number);
      if (!y || !mo || !d) continue;
      const hm = parseHM(t.dueTime) ?? parseHM(t.reminderTime) ?? defaultHM;
      const when = new Date(y, mo - 1, d, hm.hour, hm.minute, 0, 0);
      if (when.getTime() <= now) continue;
      jobs.push(
        Notifications.scheduleNotificationAsync({
          content: { title: 'Task due', body: t.title ?? 'You have a task due today' },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
        }),
      );
    }
  }

  // Habit reminders — daily at the habit's reminder time.
  if (settings.habitReminders) {
    for (const h of habits) {
      if (!h?.reminderEnabled) continue;
      const hm = parseHM(h.reminderTime);
      if (!hm) continue;
      jobs.push(
        Notifications.scheduleNotificationAsync({
          content: { title: h.name ?? 'Habit reminder', body: 'Time to keep your streak going 🔥' },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hm.hour, minute: hm.minute },
        }),
      );
    }
  }

  // Weekly debrief — Sunday 18:00 (weekday: 1 = Sunday).
  if (settings.weeklyDebrief) {
    jobs.push(
      Notifications.scheduleNotificationAsync({
        content: { title: 'Your week in review', body: "See how your week went and plan the next one." },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 18, minute: 0 },
      }),
    );
  }

  await Promise.allSettled(jobs);
}
