// Local persistence for lightweight user preferences.
//
// We use expo-secure-store because it's already a dependency (no new native
// module / rebuild needed). These payloads are tiny (a short array + two
// booleans, well under SecureStore's ~2KB platform limit), so it's a pragmatic
// home for them. If prefs ever need to sync across devices, move these into the
// existing Supabase `user_settings` table instead.
import * as SecureStore from 'expo-secure-store';
import { DEFAULT_FOCUS_AREAS, FOCUS_AREA_KEYS } from './constants/areas';

const KEY = 'taskflow.prefs.v1';

export const PREF_DEFAULTS = {
  focusAreas: DEFAULT_FOCUS_AREAS,
  onboarded: false,
  reduceMotion: false, // in-app override layered on top of the OS setting
  appLock: false,      // require biometric/passcode to open the app
};

export async function loadPrefs() {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return { ...PREF_DEFAULTS };
    const parsed = JSON.parse(raw);

    const areas = Array.isArray(parsed.focusAreas)
      ? parsed.focusAreas.filter((a) => FOCUS_AREA_KEYS.includes(a))
      : [];

    return {
      focusAreas: areas.length ? areas : PREF_DEFAULTS.focusAreas,
      onboarded: !!parsed.onboarded,
      reduceMotion: !!parsed.reduceMotion,
      appLock: !!parsed.appLock,
    };
  } catch {
    // Corrupt/unavailable storage — fall back to safe defaults.
    return { ...PREF_DEFAULTS };
  }
}

export async function savePrefs({ focusAreas, onboarded, reduceMotion, appLock }) {
  try {
    await SecureStore.setItemAsync(
      KEY,
      JSON.stringify({ focusAreas, onboarded, reduceMotion, appLock }),
    );
  } catch {
    // Best-effort; never let a persistence hiccup crash a user flow.
  }
}
