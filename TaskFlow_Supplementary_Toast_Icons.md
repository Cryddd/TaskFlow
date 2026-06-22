# TaskFlow — Supplementary Prompt: Toast Notifications & Material Icons
**Project:** TaskFlow — To-Do List Mobile Application
**Applies to:** All screens defined in the main UI/UX prompt
**Type:** Additive — does not override any existing spec

---

## 1. Material Icons

### Library
Use **@expo/vector-icons — MaterialIcons** as the sole icon library across the entire app.

```bash
# Already bundled with Expo — no extra install needed
import { MaterialIcons } from '@expo/vector-icons';
```

### Usage Pattern
```jsx
<MaterialIcons
  name="check-circle"
  size={24}
  color={colors.primary[500]}
/>
```

### Size Rules
| Context | Size |
|---|---|
| Bottom navigation tabs | 24px |
| In-line with body text | 18px |
| Action buttons (FAB, CTA row) | 24px |
| Section header actions | 20px |
| Inside chips / badges | 14px |
| Empty state illustration icon | 48px |

### Icon Map — replace every icon reference in the main prompt with these exact Material names:

| Element | MaterialIcons name |
|---|---|
| Home tab | `home` |
| Tasks tab | `check-box` |
| Calendar tab | `calendar-today` |
| Discover tab | `explore` |
| Profile tab | `person` |
| FAB (add) | `add` |
| FAB (close) | `close` |
| New Task action | `assignment-add` |
| New Habit action | `loop` |
| New Note action | `sticky-note-2` |
| New Event action | `event` |
| Search | `search` |
| Filter / Sort | `tune` |
| Notifications (bell) | `notifications` |
| Notifications (with badge) | `notifications-active` |
| Menu / Hamburger | `menu` |
| Back arrow | `arrow-back` |
| Forward / chevron right | `chevron-right` |
| Edit / pencil | `edit` |
| Delete / trash | `delete` |
| Share | `share` |
| Complete / check | `check-circle` |
| Unchecked circle | `radio-button-unchecked` |
| Priority / flag | `flag` |
| Habit / streak | `bolt` |
| Focus / timer | `timer` |
| Schedule / clock | `schedule` |
| Reminder / alarm | `alarm` |
| Repeat | `repeat` |
| Tag | `label` |
| Subtask | `subdirectory-arrow-right` |
| Difficulty | `signal-cellular-alt` |
| Goal | `emoji-events` |
| Notes | `sticky-note-2` |
| Nutrition | `restaurant` |
| Drag handle | `drag-handle` |
| Settings | `settings` |
| Personal info | `manage-accounts` |
| Privacy / lock | `lock` |
| Contact support | `headset-mic` |
| Log out | `logout` |
| Microphone (search) | `mic` |
| Community / people | `group` |
| Overdue warning | `warning-amber` |
| Success / done all | `done-all` |
| Swipe → complete | `check-circle-outline` |
| Swipe → schedule | `event-available` |
| Swipe → delete | `delete-sweep` |
| Swipe → details | `info-outline` |
| Weekly debrief | `bar-chart` |
| Smart suggest | `tips-and-updates` |

### Color Rules for Icons
Icons always inherit their color from context — never hardcode a color directly on the icon. Pass color as a prop from the design token:

```jsx
// Active state
<MaterialIcons name="home" size={24} color={colors.primary[500]} />

// Inactive / muted
<MaterialIcons name="home" size={24} color={colors.gray[400]} />

// On dark backgrounds (Focus Mode, Premium card future)
<MaterialIcons name="timer" size={24} color="#FFFFFF" />

// Danger actions (delete, log out)
<MaterialIcons name="delete" size={24} color={colors.danger[400]} />
```

---

## 2. Toast Notifications

### Library
Use **react-native-toast-message** for all toast notifications.

```bash
npm install react-native-toast-message
```

### Root Setup
Register the Toast component once at the app root — above everything else:

```jsx
// App.jsx (root)
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';

export default function App() {
  return (
    <>
      <NavigationContainer>
        {/* ...rest of app */}
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  );
}
```

### Custom Toast Config
TaskFlow uses three custom toast types that match the design system. Define them in `src/config/toastConfig.jsx`:

```jsx
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radius } from '../theme';

const baseStyle = {
  width: '90%',
  borderRadius: radius.md,
  paddingVertical: 12,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  shadowColor: colors.gray[900],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.10,
  shadowRadius: 12,
  elevation: 6,
};

export const toastConfig = {

  // SUCCESS — task completed, habit logged, item saved
  taskflow_success: ({ text1, text2 }) => (
    <View style={{ ...baseStyle, backgroundColor: '#FFFFFF', borderLeftWidth: 4, borderLeftColor: colors.success[400] }}>
      <MaterialIcons name="check-circle" size={20} color={colors.success[400]} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.gray[900], fontFamily: 'Inter-SemiBold' }}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={{ fontSize: 12, color: colors.gray[400], fontFamily: 'Inter-Regular', marginTop: 2 }}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  ),

  // ERROR — failed save, overdue alert, validation error
  taskflow_error: ({ text1, text2 }) => (
    <View style={{ ...baseStyle, backgroundColor: '#FFFFFF', borderLeftWidth: 4, borderLeftColor: colors.danger[400] }}>
      <MaterialIcons name="warning-amber" size={20} color={colors.danger[400]} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.gray[900], fontFamily: 'Inter-SemiBold' }}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={{ fontSize: 12, color: colors.gray[400], fontFamily: 'Inter-Regular', marginTop: 2 }}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  ),

  // INFO — reminders, suggestions, neutral system messages
  taskflow_info: ({ text1, text2 }) => (
    <View style={{ ...baseStyle, backgroundColor: '#FFFFFF', borderLeftWidth: 4, borderLeftColor: colors.primary[500] }}>
      <MaterialIcons name="tips-and-updates" size={20} color={colors.primary[500]} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.gray[900], fontFamily: 'Inter-SemiBold' }}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={{ fontSize: 12, color: colors.gray[400], fontFamily: 'Inter-Regular', marginTop: 2 }}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  ),
};
```

### Toast Trigger Utility
Centralize all toast calls in `src/utils/toast.js` so the wording is consistent everywhere:

```js
import Toast from 'react-native-toast-message';

export const showToast = {

  // Tasks
  taskCreated: () => Toast.show({ type: 'taskflow_success', text1: 'Task added', text2: 'Tap to view details', visibilityTime: 2500 }),
  taskCompleted: (taskName) => Toast.show({ type: 'taskflow_success', text1: 'Done', text2: taskName, visibilityTime: 2000 }),
  taskDeleted: () => Toast.show({ type: 'taskflow_info', text1: 'Task removed', visibilityTime: 2000 }),
  taskUpdated: () => Toast.show({ type: 'taskflow_success', text1: 'Task updated', visibilityTime: 2000 }),

  // Habits
  habitLogged: (habitName) => Toast.show({ type: 'taskflow_success', text1: 'Habit logged', text2: habitName, visibilityTime: 2500 }),
  habitCreated: () => Toast.show({ type: 'taskflow_success', text1: 'Habit created', text2: 'It will appear on your Home screen', visibilityTime: 2500 }),
  streakMilestone: (days) => Toast.show({ type: 'taskflow_success', text1: `🔥 ${days}-day streak!`, text2: 'Keep it going', visibilityTime: 3000 }),

  // Notes
  noteSaved: () => Toast.show({ type: 'taskflow_success', text1: 'Note saved', visibilityTime: 2000 }),

  // System / errors
  saveFailed: () => Toast.show({ type: 'taskflow_error', text1: 'Could not save', text2: 'Check your connection and try again', visibilityTime: 3000 }),
  networkError: () => Toast.show({ type: 'taskflow_error', text1: 'No connection', text2: 'Changes will sync when you are back online', visibilityTime: 3000 }),
  overdueReminder: (count) => Toast.show({ type: 'taskflow_error', text1: `${count} overdue task${count > 1 ? 's' : ''}`, text2: 'Tap to review', visibilityTime: 3500 }),
  reminderFired: (taskName) => Toast.show({ type: 'taskflow_info', text1: 'Reminder', text2: taskName, visibilityTime: 3000 }),
  profileUpdated: () => Toast.show({ type: 'taskflow_success', text1: 'Profile updated', visibilityTime: 2000 }),
  logoutConfirmed: () => Toast.show({ type: 'taskflow_info', text1: 'Logged out', visibilityTime: 2000 }),
};
```

### When to Fire Each Toast

| User action | Toast type | text1 | text2 |
|---|---|---|---|
| Taps completion circle on task | `taskflow_success` | "Done" | task name |
| Saves a new task | `taskflow_success` | "Task added" | "Tap to view details" |
| Saves an edited task | `taskflow_success` | "Task updated" | — |
| Swipe-deletes a task | `taskflow_info` | "Task removed" | — |
| Saves a new habit | `taskflow_success` | "Habit created" | "It will appear on your Home screen" |
| Logs a habit for today | `taskflow_success` | "Habit logged" | habit name |
| Hits 7 / 14 / 30-day streak | `taskflow_success` | "🔥 X-day streak!" | "Keep it going" |
| Saves a note | `taskflow_success` | "Note saved" | — |
| Any save fails (network) | `taskflow_error` | "Could not save" | "Check your connection and try again" |
| Reminder fires for a task | `taskflow_info` | "Reminder" | task name |
| Overdue tasks detected on open | `taskflow_error` | "X overdue tasks" | "Tap to review" |
| Profile saved | `taskflow_success` | "Profile updated" | — |
| Log out confirmed | `taskflow_info` | "Logged out" | — |

### Position & Behavior Rules
```
Position:   top (default for all toasts)
Offset:     60px from top (clears the status bar + top navigation bar)
Duration:   2000ms for confirmations, 3000–3500ms for errors and reminders
Tap to dismiss: enabled on all toasts
Auto-dismiss: always on — never leave a toast permanently on screen
Max visible at once: 1 (queue subsequent toasts, do not stack)
```

```jsx
// Global default options — set once in toastConfig or App root
Toast.show({
  ...options,
  position: 'top',
  topOffset: 60,
  autoHide: true,
});
```

---

## 3. Integration Checklist

Before marking any screen complete, verify:

- [ ] All icons use `MaterialIcons` from `@expo/vector-icons` — no other icon libraries
- [ ] Every icon references an exact name from the Icon Map above
- [ ] Icon sizes follow the Size Rules table (no freehand sizing)
- [ ] Icon color is always passed from `colors.*` token — never a hardcoded hex on the icon prop
- [ ] `<Toast />` is mounted once at the app root, above all navigation
- [ ] All toast calls go through `showToast.*` utility — no raw `Toast.show()` calls scattered in screens
- [ ] Every destructive or confirmatory user action fires the correct toast type
- [ ] Toast position is `top`, offset `60px`, auto-hides — never stacks

---

*This prompt is additive. All spacing, color, and typography decisions continue to follow the main TaskFlow UI/UX Enhancement Prompt (v1.1).*
