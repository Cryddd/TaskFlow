import { create } from 'zustand';
import { loadPrefs, savePrefs, PREF_DEFAULTS } from './prefs';

const fmt = (d) => d.toISOString().split('T')[0];

export const useStore = create((set, get) => ({
  selectedDate: fmt(new Date()),
  activeCategory: 'all',
  activeTag: null,

  // Persisted prefs — hydrated from SecureStore at app start (see hydratePrefs).
  hydrated: false,
  onboarded: PREF_DEFAULTS.onboarded,
  focusAreas: PREF_DEFAULTS.focusAreas,
  reduceMotion: PREF_DEFAULTS.reduceMotion,
  appLock: PREF_DEFAULTS.appLock,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setActiveTag: (tag) => set({ activeTag: tag }),

  // Load persisted prefs once on launch, before the splash hides.
  hydratePrefs: async () => {
    const prefs = await loadPrefs();
    set({ ...prefs, hydrated: true });
  },

  setFocusAreas: (areas) => {
    set({ focusAreas: areas });
    persist(get);
  },
  setOnboarded: (v) => {
    set({ onboarded: v });
    persist(get);
  },
  setReduceMotion: (v) => {
    set({ reduceMotion: v });
    persist(get);
  },
  setAppLock: (v) => {
    set({ appLock: v });
    persist(get);
  },
}));

// Fire-and-forget write of the persisted slice after any pref change.
function persist(get) {
  const { focusAreas, onboarded, reduceMotion, appLock } = get();
  savePrefs({ focusAreas, onboarded, reduceMotion, appLock });
}
