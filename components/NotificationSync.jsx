import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useSettings } from '../lib/hooks/useProfile';
import { useTasks } from '../lib/hooks/useTasks';
import { useHabits } from '../lib/hooks/useHabits';
import { configureNotifications, syncNotifications } from '../lib/notifications';

// Headless: keeps scheduled local reminders in sync with the user's tasks,
// habits, and notification settings. Re-syncs on data change and on foreground.
export default function NotificationSync() {
  const { data: settings } = useSettings();
  const { data: tasks } = useTasks();
  const { data: habits } = useHabits();
  const appState = useRef(AppState.currentState);

  useEffect(() => { configureNotifications(); }, []);

  const resync = () => {
    if (!settings) return;
    syncNotifications({
      tasks: tasks ?? [],
      habits: habits ?? [],
      settings: settings.notificationSettings,
    });
  };

  useEffect(() => { resync(); }, [settings, tasks, habits]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appState.current;
      appState.current = next;
      if (/inactive|background/.test(prev) && next === 'active') resync();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, tasks, habits]);

  return null;
}
