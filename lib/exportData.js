import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { fetchProfile, fetchHabits, fetchNotes, fetchGoals } from './api/index';
import { fetchTasks } from './api/tasks';

// Gathers everything the user owns, writes it to a JSON file in the cache dir,
// and opens the OS share sheet so they can save or send it. Expo Go safe
// (expo-file-system + expo-sharing are bundled in Expo Go).
export async function exportUserData() {
  const [profile, tasks, habits, notes, goals] = await Promise.all([
    fetchProfile(),
    fetchTasks(),
    fetchHabits(),
    fetchNotes(),
    fetchGoals(),
  ]);

  const counts = {
    tasks: tasks?.length ?? 0,
    habits: habits?.length ?? 0,
    notes: notes?.length ?? 0,
    goals: goals?.length ?? 0,
  };

  const payload = {
    app: 'TaskFlow',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    profile,
    counts,
    data: { tasks, habits, notes, goals },
  };

  const json = JSON.stringify(payload, null, 2);
  const stamp = new Date().toISOString().slice(0, 10);
  const file = new File(Paths.cache, `taskflow-export-${stamp}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export TaskFlow data',
      UTI: 'public.json',
    });
  }

  return { counts, shared: canShare, uri: file.uri };
}
