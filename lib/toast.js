import Toast from 'react-native-toast-message';

const DEFAULTS = {
  position: 'top',
  topOffset: 60,
  autoHide: true,
};

function show(type, options) {
  Toast.show({ ...DEFAULTS, type, ...options });
}

export const showToast = {
  taskCreated: () =>
    show('taskflow_success', {
      text1: 'Task added',
      text2: 'Tap to view details',
      visibilityTime: 2500,
    }),
  taskCompleted: (taskName) =>
    show('taskflow_success', {
      text1: 'Done',
      text2: taskName,
      visibilityTime: 2000,
    }),
  taskDeleted: () =>
    show('taskflow_info', { text1: 'Task removed', visibilityTime: 2000 }),
  taskUpdated: () =>
    show('taskflow_success', { text1: 'Task updated', visibilityTime: 2000 }),
  habitLogged: (habitName) =>
    show('taskflow_success', {
      text1: 'Habit logged',
      text2: habitName,
      visibilityTime: 2500,
    }),
  habitCreated: () =>
    show('taskflow_success', {
      text1: 'Habit created',
      text2: 'It will appear on your Home screen',
      visibilityTime: 2500,
    }),
  streakMilestone: (days) =>
    show('taskflow_success', {
      text1: `🔥 ${days}-day streak!`,
      text2: 'Keep it going',
      visibilityTime: 3000,
    }),
  noteSaved: () =>
    show('taskflow_success', { text1: 'Note saved', visibilityTime: 2000 }),
  saveFailed: () =>
    show('taskflow_error', {
      text1: 'Could not save',
      text2: 'Check your connection and try again',
      visibilityTime: 3000,
    }),
  networkError: () =>
    show('taskflow_error', {
      text1: 'No connection',
      text2: 'Changes will sync when you are back online',
      visibilityTime: 3000,
    }),
  overdueReminder: (count) =>
    show('taskflow_error', {
      text1: `${count} overdue task${count > 1 ? 's' : ''}`,
      text2: 'Tap to review',
      visibilityTime: 3500,
    }),
  reminderFired: (taskName) =>
    show('taskflow_info', {
      text1: 'Reminder',
      text2: taskName,
      visibilityTime: 3000,
    }),
  profileUpdated: () =>
    show('taskflow_success', { text1: 'Profile updated', visibilityTime: 2000 }),
  logoutConfirmed: () =>
    show('taskflow_info', { text1: 'Logged out', visibilityTime: 2000 }),
};
