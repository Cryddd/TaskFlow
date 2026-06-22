export function toCamelCase(obj) {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      toCamelCase(v),
    ])
  );
}

export function toSnakeCase(obj) {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
      toSnakeCase(v),
    ])
  );
}

export function fmtDate(d) {
  if (!d) return null;
  if (typeof d === 'string') return d.split('T')[0];
  return d.toISOString().split('T')[0];
}

export function fmtTime(t) {
  if (!t) return null;
  if (typeof t === 'string') return t.slice(0, 5);
  return t;
}

export function handleSupabaseError(error) {
  if (!error) return 'An unexpected error occurred';
  return error.message || 'Something went wrong';
}

export function mapTask(row, subtasks = []) {
  if (!row) return null;
  const t = toCamelCase(row);
  return {
    ...t,
    dueDate: fmtDate(t.dueDate),
    dueTime: fmtTime(t.dueTime),
    reminderTime: fmtTime(t.reminderTime),
    tags: t.tags ?? [],
    subtasks: subtasks.map((s) => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
    })),
  };
}

export function mapHabit(row, completions = []) {
  if (!row) return null;
  const h = toCamelCase(row);
  const today = fmtDate(new Date());
  const completedToday = completions.some((c) => c.date === today && c.completed);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekProgress = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = fmtDate(d);
    return completions.some((c) => c.date === dateStr && c.completed);
  });

  const sortedDates = completions
    .filter((c) => c.completed)
    .map((c) => c.date)
    .sort()
    .reverse();

  let streak = 0;
  const check = new Date();
  for (let i = 0; i < 365; i++) {
    const ds = fmtDate(check);
    if (sortedDates.includes(ds)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else if (i === 0 && ds === today && !completedToday) {
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  const totalCompleted = completions.filter((c) => c.completed).length;

  return {
    ...h,
    targetDays: h.targetDays ?? ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    completedToday,
    weekProgress,
    streak,
    bestStreak: streak,
    totalCompleted,
    goal: h.description,
    repeat: h.targetDays?.length === 7 ? 'Every day' : 'Custom',
    reminder: h.reminderTime ? h.reminderTime : 'None',
    reminderTime: fmtTime(h.reminderTime),
    goalStartDate: fmtDate(h.goalStartDate),
    createdAt: fmtDate(h.createdAt),
  };
}

export function mapNote(row) {
  if (!row) return null;
  const n = toCamelCase(row);
  return {
    ...n,
    tags: n.tags ?? [],
    createdAt: fmtDate(n.createdAt),
    updatedAt: fmtDate(n.updatedAt),
  };
}

export function mapProfile(row) {
  if (!row) return null;
  const p = toCamelCase(row);
  const initials = p.fullName
    ? p.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  return {
    fullName: p.fullName ?? '',
    email: p.email ?? '',
    username: p.username ?? '',
    avatarUri: p.avatarUrl ?? null,
    avatarUrl: p.avatarUrl ?? null,
    initials,
    memberSince: fmtDate(p.memberSince),
  };
}

export function mapGoal(row) {
  if (!row) return null;
  const g = toCamelCase(row);
  return { ...g, targetDate: fmtDate(g.targetDate) };
}
