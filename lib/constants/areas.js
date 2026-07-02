// Single source of truth for the app's focus areas. Used by the onboarding
// setup wizard, the Profile focus editor, and the Home hub personalization so
// keys/labels/icons never drift between screens.
export const FOCUS_AREAS = [
  { key: 'tasks',     icon: 'checklist',             label: 'Tasks',     blurb: 'Plan & track to-dos' },
  { key: 'habits',    icon: 'local-fire-department', label: 'Habits',    blurb: 'Build daily streaks' },
  { key: 'focus',     icon: 'timer',                 label: 'Focus',     blurb: 'Deep-work sessions' },
  { key: 'nutrition', icon: 'restaurant',            label: 'Nutrition', blurb: 'Log meals & macros' },
  { key: 'goals',     icon: 'flag',                  label: 'Goals',     blurb: 'Long-term targets' },
  { key: 'notes',     icon: 'sticky-note-2',         label: 'Notes',     blurb: 'Capture ideas' },
];

export const FOCUS_AREA_KEYS = FOCUS_AREAS.map((a) => a.key);

export const DEFAULT_FOCUS_AREAS = ['tasks', 'habits', 'focus', 'nutrition'];

// Quick lookup by key.
export const FOCUS_AREA_MAP = FOCUS_AREAS.reduce((acc, a) => {
  acc[a.key] = a;
  return acc;
}, {});
