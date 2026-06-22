import { create } from 'zustand';

const fmt = (d) => d.toISOString().split('T')[0];

export const useStore = create((set) => ({
  selectedDate: fmt(new Date()),
  activeCategory: 'all',
  activeTag: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setActiveTag: (tag) => set({ activeTag: tag }),
}));
