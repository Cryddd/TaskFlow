import { create } from 'zustand';

const fmt = (d) => d.toISOString().split('T')[0];

export const useStore = create((set) => ({
  selectedDate: fmt(new Date()),
  activeCategory: 'all',
  activeTag: null,

  // Onboarding (session-scoped for now; persist later via settings/AsyncStorage).
  onboarded: false,
  focusAreas: ['tasks', 'habits', 'focus', 'nutrition'],

  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setActiveTag: (tag) => set({ activeTag: tag }),
  setFocusAreas: (areas) => set({ focusAreas: areas }),
  setOnboarded: (v) => set({ onboarded: v }),
}));
