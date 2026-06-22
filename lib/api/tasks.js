import { supabase } from '../supabase';
import { mapTask, fmtDate } from './utils';

async function fetchSubtasks(taskIds) {
  if (!taskIds.length) return {};
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .in('task_id', taskIds)
    .order('sort_order');
  if (error) throw error;
  return data.reduce((acc, s) => {
    if (!acc[s.task_id]) acc[s.task_id] = [];
    acc[s.task_id].push(s);
    return acc;
  }, {});
}

async function fetchTaskTags(taskIds) {
  if (!taskIds.length) return {};
  const { data: links, error: linkErr } = await supabase
    .from('task_tags')
    .select('task_id, tag_id')
    .in('task_id', taskIds);
  if (linkErr) throw linkErr;
  if (!links?.length) return {};

  const tagIds = [...new Set(links.map((l) => l.tag_id))];
  const { data: tags, error: tagErr } = await supabase
    .from('tags')
    .select('id, name')
    .in('id', tagIds);
  if (tagErr) throw tagErr;

  const tagMap = Object.fromEntries((tags ?? []).map((t) => [t.id, t.name]));
  return links.reduce((acc, row) => {
    if (!acc[row.task_id]) acc[row.task_id] = [];
    const name = tagMap[row.tag_id];
    if (name) acc[row.task_id].push(`#${name.replace(/^#/, '')}`);
    return acc;
  }, {});
}

export async function fetchTasks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const ids = data.map((t) => t.id);
  const [subtasksMap, tagsMap] = await Promise.all([
    fetchSubtasks(ids),
    fetchTaskTags(ids),
  ]);

  return data.map((row) => {
    const task = mapTask(row, subtasksMap[row.id] ?? []);
    task.tags = tagsMap[row.id] ?? [];
    return task;
  });
}

export async function fetchTaskById(id) {
  const tasks = await fetchTasks();
  return tasks.find((t) => t.id === id) ?? null;
}

export async function createTask(task) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { subtasks = [], tags = [], ...rest } = task;
  const row = {
    user_id: user.id,
    title: rest.title,
    description: rest.description ?? '',
    priority: rest.priority ?? 'medium',
    difficulty: rest.difficulty ?? 'regular',
    status: rest.status ?? 'pending',
    category: rest.category ?? 'work',
    due_date: rest.dueDate ?? fmtDate(new Date()),
    due_time: rest.dueTime ?? null,
    completed: rest.completed ?? false,
    reminder_enabled: rest.reminderEnabled ?? false,
    reminder_time: rest.reminderTime ?? null,
    repeat_rule: rest.repeatRule ?? 'none',
    focus_minutes: rest.focusMinutes ?? 0,
  };

  const { data, error } = await supabase.from('tasks').insert(row).select().single();
  if (error) throw error;

  if (subtasks.length) {
    await supabase.from('subtasks').insert(
      subtasks.map((s, i) => ({
        task_id: data.id,
        user_id: user.id,
        title: s.title,
        completed: s.completed ?? false,
        sort_order: i,
      }))
    );
  }

  if (tags.length) {
    for (const tag of tags) {
      const name = tag.replace(/^#/, '');
      let { data: tagRow } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name)
        .maybeSingle();
      if (!tagRow) {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({ user_id: user.id, name })
          .select()
          .single();
        tagRow = newTag;
      }
      if (tagRow) {
        await supabase.from('task_tags').insert({ task_id: data.id, tag_id: tagRow.id });
      }
    }
  }

  return fetchTaskById(data.id);
}

export async function updateTask(id, updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { subtasks, tags, ...rest } = updates;
  const row = {};
  if (rest.title !== undefined) row.title = rest.title;
  if (rest.description !== undefined) row.description = rest.description;
  if (rest.priority !== undefined) row.priority = rest.priority;
  if (rest.difficulty !== undefined) row.difficulty = rest.difficulty;
  if (rest.status !== undefined) row.status = rest.status;
  if (rest.category !== undefined) row.category = rest.category;
  if (rest.dueDate !== undefined) row.due_date = rest.dueDate;
  if (rest.dueTime !== undefined) row.due_time = rest.dueTime;
  if (rest.completed !== undefined) {
    row.completed = rest.completed;
    row.status = rest.completed ? 'completed' : (rest.status ?? 'pending');
  }
  if (rest.reminderEnabled !== undefined) row.reminder_enabled = rest.reminderEnabled;
  if (rest.reminderTime !== undefined) row.reminder_time = rest.reminderTime;
  if (rest.focusMinutes !== undefined) row.focus_minutes = rest.focusMinutes;

  if (Object.keys(row).length) {
    const { error } = await supabase.from('tasks').update(row).eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  }

  if (subtasks !== undefined) {
    await supabase.from('subtasks').delete().eq('task_id', id);
    if (subtasks.length) {
      await supabase.from('subtasks').insert(
        subtasks.map((s, i) => ({
          task_id: id,
          user_id: user.id,
          title: s.title,
          completed: s.completed ?? false,
          sort_order: i,
        }))
      );
    }
  }

  return fetchTaskById(id);
}

export async function deleteTask(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
}

export async function toggleTask(id) {
  const task = await fetchTaskById(id);
  if (!task) throw new Error('Task not found');
  return updateTask(id, {
    completed: !task.completed,
    status: !task.completed ? 'completed' : 'pending',
  });
}

export async function toggleSubtask(taskId, subtaskId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: subtask, error: fetchErr } = await supabase
    .from('subtasks')
    .select('*')
    .eq('id', subtaskId)
    .eq('task_id', taskId)
    .single();
  if (fetchErr) throw fetchErr;

  const { error } = await supabase
    .from('subtasks')
    .update({ completed: !subtask.completed })
    .eq('id', subtaskId);
  if (error) throw error;

  return fetchTaskById(taskId);
}

export function getSuggestedTasks(tasks, selectedDate) {
  const pending = tasks.filter((t) => !t.completed && t.dueDate === selectedDate);
  const score = (t) => {
    const p = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 }[t.priority] ?? 0;
    const d = { easy: 3, regular: 2, hard: 1 }[t.difficulty] ?? 0;
    return p * 2 + d;
  };
  return [...pending].sort((a, b) => score(b) - score(a)).slice(0, 3);
}

export function getDailyStats(tasks, habits, goals, selectedDate) {
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
}

export function getOverdueCount(tasks) {
  const today = fmtDate(new Date());
  return tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;
}
