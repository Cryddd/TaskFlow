import { create } from 'zustand';

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Design system review with team',
    description: 'Review the updated component library and token changes before the sprint.',
    priority: 'urgent',
    difficulty: 'regular',
    status: 'in_progress',
    category: 'work',
    tags: ['#Design', '#Sprint'],
    dueDate: fmt(today),
    dueTime: '10:00',
    completed: false,
    subtasks: [
      { id: 'st1', title: 'Prepare slides', completed: true },
      { id: 'st2', title: 'Share Figma link', completed: false },
    ],
    focusMinutes: 0,
    createdAt: fmt(addDays(today, -2)),
  },
  {
    id: 't2',
    title: 'Write unit tests for auth module',
    description: 'Cover login, logout, and token refresh flows.',
    priority: 'high',
    difficulty: 'hard',
    status: 'pending',
    category: 'work',
    tags: ['#Code', '#Tests'],
    dueDate: fmt(today),
    dueTime: '14:00',
    completed: false,
    subtasks: [],
    focusMinutes: 0,
    createdAt: fmt(addDays(today, -1)),
  },
  {
    id: 't3',
    title: 'Morning run — 5km',
    description: '',
    priority: 'medium',
    difficulty: 'regular',
    status: 'pending',
    category: 'personal',
    tags: ['#Fitness'],
    dueDate: fmt(today),
    dueTime: '07:00',
    completed: false,
    subtasks: [],
    focusMinutes: 0,
    createdAt: fmt(addDays(today, -3)),
  },
  {
    id: 't4',
    title: 'Read "Atomic Habits" — ch. 9-12',
    description: 'Focus on implementation intentions and habit stacking.',
    priority: 'low',
    difficulty: 'easy',
    status: 'pending',
    category: 'personal',
    tags: ['#Reading'],
    dueDate: fmt(addDays(today, 1)),
    dueTime: null,
    completed: false,
    subtasks: [],
    focusMinutes: 0,
    createdAt: fmt(addDays(today, -1)),
  },
  {
    id: 't5',
    title: 'Refactor task list component',
    description: 'Extract TaskItem into a separate file with proper prop types.',
    priority: 'medium',
    difficulty: 'regular',
    status: 'pending',
    category: 'work',
    tags: ['#Code', '#Refactor'],
    dueDate: fmt(addDays(today, 2)),
    dueTime: null,
    completed: false,
    subtasks: [],
    focusMinutes: 45,
    createdAt: fmt(addDays(today, -4)),
  },
  {
    id: 't6',
    title: 'Prepare Q3 OKR presentation',
    description: '',
    priority: 'high',
    difficulty: 'hard',
    status: 'pending',
    category: 'work',
    tags: ['#OKRs', '#Presentation'],
    dueDate: fmt(addDays(today, 3)),
    dueTime: '09:00',
    completed: false,
    subtasks: [
      { id: 'st3', title: 'Gather metrics', completed: false },
      { id: 'st4', title: 'Draft slides', completed: false },
    ],
    focusMinutes: 0,
    createdAt: fmt(today),
  },
  {
    id: 't7',
    title: 'Grocery shopping',
    description: 'Milk, eggs, oats, chicken, vegetables.',
    priority: 'medium',
    difficulty: 'easy',
    status: 'completed',
    category: 'personal',
    tags: ['#Errands'],
    dueDate: fmt(today),
    dueTime: null,
    completed: true,
    subtasks: [],
    focusMinutes: 0,
    createdAt: fmt(addDays(today, -1)),
  },
  {
    id: 't8',
    title: 'Update README documentation',
    description: 'Add setup instructions and environment variables section.',
    priority: 'low',
    difficulty: 'easy',
    status: 'completed',
    category: 'work',
    tags: ['#Docs'],
    dueDate: fmt(today),
    dueTime: null,
    completed: true,
    subtasks: [],
    focusMinutes: 0,
    createdAt: fmt(addDays(today, -2)),
  },
  {
    id: 't9',
    title: 'Set weekly goals for productivity',
    description: 'Review last week and plan improvements.',
    priority: 'medium',
    difficulty: 'easy',
    status: 'completed',
    category: 'goals',
    tags: ['#Goals'],
    dueDate: fmt(today),
    dueTime: null,
    completed: true,
    subtasks: [],
    focusMinutes: 0,
    createdAt: fmt(today),
  },
];

const INITIAL_HABITS = [
  {
    id: 'h1',
    name: 'Drink Water',
    icon: '💧',
    description: '8 glasses per day',
    targetDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    streak: 14,
    completedToday: true,
    weekProgress: [true, true, false, true, true, true, true],
    totalCompleted: 38,
    color: '#6C63D1',
    category: 'Health',
    difficulty: 'easy',
  },
  {
    id: 'h2',
    name: 'Meditate',
    icon: '🧘',
    description: '10 minutes mindfulness',
    targetDays: ['M', 'T', 'W', 'T', 'F'],
    streak: 7,
    completedToday: true,
    weekProgress: [false, true, true, true, true, false, false],
    totalCompleted: 21,
    color: '#22C55E',
    category: 'Mindfulness',
    difficulty: 'regular',
  },
  {
    id: 'h3',
    name: 'Read',
    icon: '📚',
    description: '30 minutes daily reading',
    targetDays: ['M', 'T', 'W', 'T', 'F', 'S'],
    streak: 3,
    completedToday: false,
    weekProgress: [false, true, true, true, false, false, false],
    totalCompleted: 15,
    color: '#F59E0B',
    category: 'Learning',
    difficulty: 'easy',
  },
];

const INITIAL_NOTES = [
  {
    id: 'n1',
    title: 'Sprint retrospective ideas',
    content: 'Discuss velocity drop in last sprint. Introduce pair programming sessions for complex tasks. Review code review SLA.',
    tags: ['#Work'],
    createdAt: fmt(addDays(today, -1)),
    updatedAt: fmt(today),
  },
  {
    id: 'n2',
    title: 'Book recommendations',
    content: 'Deep Work — Cal Newport. The Pragmatic Programmer. Shape Up by Basecamp. Building a Second Brain.',
    tags: ['#Reading'],
    createdAt: fmt(addDays(today, -5)),
    updatedAt: fmt(addDays(today, -5)),
  },
  {
    id: 'n3',
    title: 'Project ideas',
    content: 'CLI tool for daily standup generation. Open source component library. Personal finance tracker with Notion integration.',
    tags: ['#Personal', '#Code'],
    createdAt: fmt(addDays(today, -3)),
    updatedAt: fmt(addDays(today, -2)),
  },
];

const INITIAL_GOALS = [
  {
    id: 'g1',
    title: 'Ship TaskFlow v1.0',
    description: 'Complete the full MVP with all core features.',
    progress: 65,
    targetDate: fmt(addDays(today, 14)),
    category: 'work',
    status: 'active',
  },
];

const INITIAL_NUTRITION = {
  calories: { current: 1420, target: 1800 },
  protein: { current: 71, target: 150, unit: 'g' },
  carbs: { current: 102, target: 200, unit: 'g' },
  fat: { current: 36, target: 67, unit: 'g' },
  meals: [
    {
      id: 'm1',
      type: 'Breakfast',
      items: [
        { id: 'fi1', name: 'Oatmeal with berries', calories: 320, protein: 10, carbs: 58, fat: 6 },
        { id: 'fi2', name: 'Greek yogurt', calories: 130, protein: 17, carbs: 9, fat: 3 },
      ],
    },
    {
      id: 'm2',
      type: 'Lunch',
      items: [
        { id: 'fi3', name: 'Grilled chicken salad', calories: 450, protein: 38, carbs: 22, fat: 18 },
        { id: 'fi4', name: 'Whole wheat bread', calories: 140, protein: 6, carbs: 26, fat: 2 },
      ],
    },
    {
      id: 'm3',
      type: 'Dinner',
      items: [
        { id: 'fi5', name: 'Salmon with quinoa', calories: 520, protein: 42, carbs: 31, fat: 18 },
      ],
    },
    {
      id: 'm4',
      type: 'Snacks',
      items: [],
    },
  ],
};

export const useStore = create((set, get) => ({
  tasks: INITIAL_TASKS,
  habits: INITIAL_HABITS,
  notes: INITIAL_NOTES,
  goals: INITIAL_GOALS,
  nutrition: INITIAL_NUTRITION,
  selectedDate: fmt(today),
  activeCategory: 'all',
  activeTag: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setActiveTag: (tag) => set({ activeTag: tag }),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, status: !t.completed ? 'completed' : 'pending' }
          : t
      ),
    })),

  addTask: (task) =>
    set((state) => ({
      tasks: [
        {
          id: `t${Date.now()}`,
          status: 'pending',
          completed: false,
          subtasks: [],
          focusMinutes: 0,
          createdAt: fmt(new Date()),
          ...task,
        },
        ...state.tasks,
      ],
    })),

  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  toggleHabit: (id) =>
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h
      ),
    })),

  addNote: (note) =>
    set((state) => ({
      notes: [
        {
          id: `n${Date.now()}`,
          createdAt: fmt(new Date()),
          updatedAt: fmt(new Date()),
          tags: [],
          ...note,
        },
        ...state.notes,
      ],
    })),

  getTodaysTasks: () => {
    const { tasks, selectedDate } = get();
    return tasks.filter((t) => t.dueDate === selectedDate);
  },

  getDailyStats: () => {
    const { tasks, habits, goals, selectedDate } = get();
    const todayTasks = tasks.filter((t) => t.dueDate === selectedDate);
    const completedTasks = todayTasks.filter((t) => t.completed).length;
    const completedHabits = habits.filter((h) => h.completedToday).length;
    const activeGoals = goals.filter((g) => g.status === 'active').length;
    const total = todayTasks.length + habits.length + activeGoals;
    const completed = completedTasks + completedHabits;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      tasks: { completed: completedTasks, total: todayTasks.length },
      habits: { completed: completedHabits, total: habits.length },
      goals: { active: activeGoals },
      overallPct: pct,
    };
  },

  getSuggestedTasks: () => {
    const { tasks, selectedDate } = get();
    const pending = tasks.filter(
      (t) => !t.completed && t.dueDate === selectedDate
    );
    const score = (t) => {
      const p = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 }[t.priority] ?? 0;
      const d = { easy: 3, regular: 2, hard: 1 }[t.difficulty] ?? 0;
      return p * 2 + d;
    };
    return [...pending].sort((a, b) => score(b) - score(a)).slice(0, 3);
  },
}));
