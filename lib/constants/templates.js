export const CATEGORY_TEMPLATES = {
  work: {
    name: 'Work & Productivity',
    icon: 'work',
    gradient: ['#334155', '#0F172A'],
    items: [
      { id: 'ct1', name: 'Daily standup prep', description: 'Review yesterday and plan today', type: 'task' },
      { id: 'ct2', name: 'Inbox zero', description: 'Clear email before end of day', type: 'habit' },
      { id: 'ct3', name: 'Deep work block', description: '90 min focused work session', type: 'habit' },
    ],
  },
  fitness: {
    name: 'Fitness & Health',
    icon: 'fitness-center',
    gradient: ['#0D9488', '#065F46'],
    items: [
      { id: 'cf1', name: 'Morning stretch', description: '10 minutes mobility routine', type: 'habit' },
      { id: 'cf2', name: 'Track workouts', description: 'Log exercise after each session', type: 'task' },
    ],
  },
  mindfulness: {
    name: 'Mindfulness',
    icon: 'self-improvement',
    gradient: ['#6C63D1', '#26215C'],
    items: [
      { id: 'cm1', name: 'Morning meditation', description: '10 min guided session', type: 'habit' },
      { id: 'cm2', name: 'Gratitude journal', description: 'Write 3 things daily', type: 'habit' },
    ],
  },
  nutrition: {
    name: 'Nutrition',
    icon: 'restaurant',
    gradient: ['#16A34A', '#14532D'],
    items: [
      { id: 'cn1', name: 'Log meals', description: 'Track everything you eat', type: 'habit' },
      { id: 'cn2', name: 'Meal prep Sunday', description: 'Prepare lunches for the week', type: 'task' },
    ],
  },
};

export const DISCOVER_CATEGORIES = [
  { id: 'work', name: 'Work & Productivity', count: '3 templates', icon: 'work', gradient: ['#334155', '#0F172A'] },
  { id: 'fitness', name: 'Fitness & Health', count: '2 templates', icon: 'fitness-center', gradient: ['#0D9488', '#065F46'] },
  { id: 'mindfulness', name: 'Mindfulness', count: '2 templates', icon: 'self-improvement', gradient: ['#6C63D1', '#26215C'] },
  { id: 'nutrition', name: 'Nutrition', count: '2 templates', icon: 'restaurant', gradient: ['#16A34A', '#14532D'] },
];
