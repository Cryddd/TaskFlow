import { showToast } from './toast';

const STREAK_MILESTONES = [7, 14, 30];

export function handleTaskToggle(tasks, id, toggleTask) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const completing = !task.completed;
  toggleTask(id);

  if (completing) {
    showToast.taskCompleted(task.title);
  }
}

export function handleTaskDelete(id, deleteTask) {
  deleteTask(id);
  showToast.taskDeleted();
}

export function handleHabitToggle(habits, id, toggleHabit) {
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  const logging = !habit.completedToday;
  toggleHabit(id);

  if (logging) {
    const newStreak = habit.streak + 1;
    showToast.habitLogged(habit.name);
    if (STREAK_MILESTONES.includes(newStreak)) {
      showToast.streakMilestone(newStreak);
    }
  }
}

export function getOverdueCount(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    if (task.completed || !task.dueDate) return false;
    const due = new Date(`${task.dueDate}T00:00:00`);
    return due < today;
  }).length;
}
