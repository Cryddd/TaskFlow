import { supabase } from '../supabase';
import { mapHabit, mapNote, mapGoal, mapProfile, fmtDate } from './utils';

async function fetchCompletions(habitIds) {
  if (!habitIds.length) return {};
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .in('habit_id', habitIds);
  if (error) throw error;
  return data.reduce((acc, c) => {
    if (!acc[c.habit_id]) acc[c.habit_id] = [];
    acc[c.habit_id].push({ date: c.date, completed: c.completed });
    return acc;
  }, {});
}

export async function fetchHabits() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const completionsMap = await fetchCompletions(data.map((h) => h.id));
  return data.map((row) => mapHabit(row, completionsMap[row.id] ?? []));
}

export async function fetchHabitById(id) {
  const habits = await fetchHabits();
  return habits.find((h) => h.id === id) ?? null;
}

export async function fetchHabitCompletions(habitId, days = 84) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const start = new Date();
  start.setDate(start.getDate() - days);

  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('habit_id', habitId)
    .gte('date', fmtDate(start))
    .order('date');
  if (error) throw error;
  return data;
}

export async function createHabit(habit) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = {
    user_id: user.id,
    name: habit.name,
    icon: habit.icon ?? '✨',
    description: habit.description ?? '',
    target_days: habit.targetDays ?? ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    color: habit.color ?? '#6C63D1',
    category: habit.category ?? 'General',
    difficulty: habit.difficulty ?? 'regular',
    goal_enabled: habit.goalEnabled ?? false,
    goal_start_date: habit.goalStartDate ?? null,
    goal_target_count: habit.goalTargetCount ?? null,
    goal_unit: habit.goalUnit ?? null,
    reminder_enabled: habit.reminderEnabled ?? false,
    reminder_time: habit.reminderTime ?? null,
  };

  const { data, error } = await supabase.from('habits').insert(row).select().single();
  if (error) throw error;
  return fetchHabitById(data.id);
}

export async function updateHabit(id, updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.icon !== undefined) row.icon = updates.icon;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.targetDays !== undefined) row.target_days = updates.targetDays;
  if (updates.color !== undefined) row.color = updates.color;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.difficulty !== undefined) row.difficulty = updates.difficulty;
  if (updates.goalEnabled !== undefined) row.goal_enabled = updates.goalEnabled;
  if (updates.goalStartDate !== undefined) row.goal_start_date = updates.goalStartDate;
  if (updates.goalTargetCount !== undefined) row.goal_target_count = updates.goalTargetCount;
  if (updates.goalUnit !== undefined) row.goal_unit = updates.goalUnit;
  if (updates.reminderEnabled !== undefined) row.reminder_enabled = updates.reminderEnabled;
  if (updates.reminderTime !== undefined) row.reminder_time = updates.reminderTime;

  const { error } = await supabase.from('habits').update(row).eq('id', id).eq('user_id', user.id);
  if (error) throw error;
  return fetchHabitById(id);
}

export async function deleteHabit(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
}

export async function toggleHabit(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const today = fmtDate(new Date());
  const { data: existing } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('habit_id', id)
    .eq('date', today)
    .maybeSingle();

  if (existing?.completed) {
    await supabase.from('habit_completions').delete().eq('id', existing.id);
  } else if (existing) {
    await supabase.from('habit_completions').update({ completed: true }).eq('id', existing.id);
  } else {
    await supabase.from('habit_completions').insert({
      habit_id: id,
      user_id: user.id,
      date: today,
      completed: true,
    });
  }

  return fetchHabitById(id);
}

export async function fetchNotes() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(mapNote);
}

export async function fetchNoteById(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return mapNote(data);
}

export async function createNote(note) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: note.title ?? '',
      content: note.content ?? '',
      tags: note.tags ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return mapNote(data);
}

export async function updateNote(id, updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.content !== undefined) row.content = updates.content;
  if (updates.tags !== undefined) row.tags = updates.tags;

  const { data, error } = await supabase
    .from('notes')
    .update(row)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return mapNote(data);
}

export async function deleteNote(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
}

export async function fetchGoals() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapGoal);
}

export async function createGoal(goal) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title: goal.title,
      description: goal.description ?? '',
      progress: goal.progress ?? 0,
      target_date: goal.targetDate ?? null,
      category: goal.category ?? 'work',
      status: goal.status ?? 'active',
    })
    .select()
    .single();
  if (error) throw error;
  return mapGoal(data);
}

export async function updateGoal(id, updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.progress !== undefined) row.progress = updates.progress;
  if (updates.targetDate !== undefined) row.target_date = updates.targetDate;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.status !== undefined) row.status = updates.status;

  const { data, error } = await supabase
    .from('goals')
    .update(row)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return mapGoal(data);
}

export async function deleteGoal(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
}

export async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) throw error;

  return mapProfile({ ...data, email: user.email });
}

export async function updateProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = {};
  if (updates.fullName !== undefined) row.full_name = updates.fullName;
  if (updates.username !== undefined) row.username = updates.username;
  if (updates.avatarUrl !== undefined) row.avatar_url = updates.avatarUrl;

  if (updates.email && updates.email !== user.email) {
    const { error: emailErr } = await supabase.auth.updateUser({ email: updates.email });
    if (emailErr) throw emailErr;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(row)
    .eq('id', user.id)
    .select()
    .single();
  if (error) throw error;

  const { data: { user: updatedUser } } = await supabase.auth.getUser();
  return mapProfile({ ...data, email: updatedUser?.email ?? user.email });
}

export async function uploadAvatar(uri) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const path = `${user.id}/avatar.${ext}`;

  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error: uploadErr } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { upsert: true, contentType: `image/${ext}` });
  if (uploadErr) throw uploadErr;

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
  return updateProfile({ avatarUrl: publicUrl });
}

export async function fetchProfileStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { completedTasks: 0, habitCount: 0, streakMax: 0, daysActive: 0 };

  const [tasksRes, habitsRes, profileRes] = await Promise.all([
    supabase.from('tasks').select('completed').eq('user_id', user.id),
    supabase.from('habits').select('id').eq('user_id', user.id),
    supabase.from('profiles').select('member_since, created_at').eq('id', user.id).single(),
  ]);

  const completedTasks = (tasksRes.data ?? []).filter((t) => t.completed).length;
  const habitCount = (habitsRes.data ?? []).length;

  const habits = await fetchHabits();
  const streakMax = habits.reduce((m, h) => Math.max(m, h.streak), 0);

  const memberSince = profileRes.data?.member_since ?? profileRes.data?.created_at;
  const daysActive = memberSince
    ? Math.max(1, Math.ceil((Date.now() - new Date(memberSince).getTime()) / 86400000))
    : 1;

  return { completedTasks, habitCount, streakMax, daysActive };
}

export async function fetchSettings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (error) throw error;

  return {
    notificationSettings: data.notification_settings,
    privacySettings: data.privacy_settings,
  };
}

export async function updateNotificationSettings(settings) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_settings')
    .update({ notification_settings: settings })
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data.notification_settings;
}

export async function updatePrivacySettings(settings) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_settings')
    .update({ privacy_settings: settings })
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data.privacy_settings;
}

export async function fetchNutrition(date) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getEmptyNutrition();

  const dateStr = date ?? fmtDate(new Date());

  let { data: daily } = await supabase
    .from('nutrition_daily')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .maybeSingle();

  if (!daily) {
    const { data: created } = await supabase
      .from('nutrition_daily')
      .insert({ user_id: user.id, date: dateStr })
      .select()
      .single();
    daily = created;
  }

  const { data: meals, error } = await supabase
    .from('meal_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .order('created_at');
  if (error) throw error;

  return buildNutrition(daily, meals ?? []);
}

function getEmptyNutrition() {
  return {
    calories: { current: 0, target: 1800 },
    protein: { current: 0, target: 150, unit: 'g' },
    carbs: { current: 0, target: 200, unit: 'g' },
    fat: { current: 0, target: 67, unit: 'g' },
    meals: [
      { id: 'Breakfast', type: 'Breakfast', items: [] },
      { id: 'Lunch', type: 'Lunch', items: [] },
      { id: 'Dinner', type: 'Dinner', items: [] },
      { id: 'Snacks', type: 'Snacks', items: [] },
    ],
  };
}

function buildNutrition(daily, meals) {
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const grouped = mealTypes.map((type) => ({
    id: type,
    type,
    items: meals
      .filter((m) => m.meal_type === type)
      .map((m) => ({
        id: m.id,
        name: m.name,
        calories: m.calories,
        protein: Number(m.protein),
        carbs: Number(m.carbs),
        fat: Number(m.fat),
      })),
  }));

  return {
    calories: { current: daily.calories_current, target: daily.calories_target },
    protein: { current: Number(daily.protein_current), target: Number(daily.protein_target), unit: 'g' },
    carbs: { current: Number(daily.carbs_current), target: Number(daily.carbs_target), unit: 'g' },
    fat: { current: Number(daily.fat_current), target: Number(daily.fat_target), unit: 'g' },
    meals: grouped,
  };
}

export async function addMealItem({ date, mealType, name, calories, protein, carbs, fat }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const dateStr = date ?? fmtDate(new Date());
  const { data, error } = await supabase
    .from('meal_items')
    .insert({
      user_id: user.id,
      date: dateStr,
      meal_type: mealType,
      name,
      calories: calories ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
    })
    .select()
    .single();
  if (error) throw error;

  await recalcNutritionDaily(user.id, dateStr);
  return data;
}

async function recalcNutritionDaily(userId, date) {
  const { data: meals } = await supabase
    .from('meal_items')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  const totals = (meals ?? []).reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + Number(m.protein),
      carbs: acc.carbs + Number(m.carbs),
      fat: acc.fat + Number(m.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  await supabase
    .from('nutrition_daily')
    .upsert({
      user_id: userId,
      date,
      calories_current: totals.calories,
      protein_current: totals.protein,
      carbs_current: totals.carbs,
      fat_current: totals.fat,
    }, { onConflict: 'user_id,date' });
}

export async function logFocusSession({ taskId, durationSeconds, sessionType, startedAt, endedAt }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({
      user_id: user.id,
      task_id: taskId,
      duration_seconds: durationSeconds,
      session_type: sessionType ?? 'work',
      started_at: startedAt,
      ended_at: endedAt,
    })
    .select()
    .single();
  if (error) throw error;

  if (taskId && sessionType === 'work') {
    const { data: task } = await supabase.from('tasks').select('focus_minutes').eq('id', taskId).single();
    if (task) {
      await supabase
        .from('tasks')
        .update({ focus_minutes: (task.focus_minutes ?? 0) + Math.round(durationSeconds / 60) })
        .eq('id', taskId);
    }
  }

  return data;
}

export async function fetchTemplateAdditions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_template_additions')
    .select('template_id')
    .eq('user_id', user.id);
  if (error) throw error;
  return data.map((r) => r.template_id);
}

export async function markTemplateAdded(templateId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_template_additions')
    .insert({ user_id: user.id, template_id: templateId });
  if (error && error.code !== '23505') throw error;
}

export async function submitBugReport({ subject, description, deviceInfo }) {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('bug_reports').insert({
    user_id: user?.id ?? null,
    subject,
    description,
    device_info: deviceInfo,
  });
  if (error) throw error;
}

export async function changePassword(currentPassword, newPassword) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error('Not authenticated');

  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInErr) throw new Error('Current password is incorrect');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function deleteAccount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Delete owned rows across every table (children first so FK constraints are
  // satisfied), then the profile. Best-effort: a missing table shouldn't block
  // account removal. Note: removing the auth user record itself requires a
  // server-side admin call — this clears all of the user's data from the client.
  const ownedTables = [
    'meal_items',
    'nutrition_daily',
    'focus_sessions',
    'habit_completions',
    'tasks',
    'habits',
    'notes',
    'goals',
    'user_settings',
    'user_template_additions',
  ];
  await Promise.allSettled(
    ownedTables.map((t) => supabase.from(t).delete().eq('user_id', user.id)),
  );

  await supabase.from('profiles').delete().eq('id', user.id);
  await supabase.auth.signOut();
}
