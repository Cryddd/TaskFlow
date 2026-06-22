# TaskFlow — UI/UX Enhancement Prompt for Cursor AI
**Prepared by: Senior UI/UX Engineer**
**Project:** TaskFlow — To-Do List Mobile Application
**Document Version:** 1.1
**Scope:** v1.0 Core Features only — Premium / Upgrade to Pro is deferred to Future Works.

---

## 📋 Overview

You are building **TaskFlow**, a professional-grade to-do list and productivity mobile application. This prompt defines the complete design system, screen architecture, interaction patterns, and UI/UX enhancement guidelines. The goal is to deliver a visually sophisticated, gender-neutral, modern productivity app that competes directly with Notion, Linear, and Todoist — but surpasses them in visual identity and experience depth.

---

## 🎯 Design Philosophy

### Core Principles
1. **Clarity over decoration** — Every visual element must earn its place by serving the user's task completion flow
2. **Systematic consistency** — A strict token-based design system governs all spacing, color, radius, and typography
3. **Progressive disclosure** — Surface essential information first; complexity reveals on demand
4. **Purposeful motion** — Micro-animations confirm actions, guide attention, and signal state changes — never decorative
5. **Accessible by default** — WCAG AA contrast ratios, touch targets minimum 44×44px, semantic labels throughout

### Tone & Personality
- **Not feminine, not masculine — Professional and focused.** Think: the UI a VP of Product would use daily
- Clean authority, not sterile coldness
- Confident hierarchy, not aggressive visual noise
- The aesthetic sits between **Linear's precision** and **Notion's warmth** — structured but human

---

## 🎨 Design System

### Color Palette
Base the entire app on this token system derived from Image 4 (the purple/violet reference):

```
PRIMARY BRAND
--color-primary-50:   #EEEDFE   (lightest tint, hover backgrounds)
--color-primary-100:  #D4D2F8   (subtle backgrounds, tags)
--color-primary-200:  #AFA9EC   (borders on interactive elements)
--color-primary-400:  #7F77DD   (secondary actions, accents)
--color-primary-500:  #6C63D1   (DEFAULT BRAND — buttons, active states, progress fills)
--color-primary-600:  #534AB7   (pressed states, strong emphasis)
--color-primary-800:  #3C3489   (text on primary-50 backgrounds)
--color-primary-900:  #26215C   (text on primary-100 backgrounds)

NEUTRAL GRAYS (the spine of the layout)
--color-gray-0:    #FFFFFF
--color-gray-25:   #F9F9FB   (page background — near white, ever so slightly cool)
--color-gray-50:   #F1F0F6   (card backgrounds, section dividers)
--color-gray-100:  #E4E3EE   (borders, dividers)
--color-gray-200:  #C8C7D8   (disabled states, placeholders)
--color-gray-400:  #8E8DA4   (secondary text, subtitles)
--color-gray-600:  #5A5970   (body text)
--color-gray-900:  #1C1B2E   (primary headings — dark indigo-tinted black, NOT pure #000)

SEMANTIC COLORS
--color-success-400: #22C55E   (task completion, habit streaks)
--color-success-50:  #F0FDF4
--color-warning-400: #F59E0B   (approaching deadlines, medium priority)
--color-warning-50:  #FFFBEB
--color-danger-400:  #EF4444   (overdue, high priority, delete)
--color-danger-50:   #FEF2F2

PRIORITY SYSTEM (visually distinct, not just color)
--priority-urgent:   #EF4444   (red)
--priority-high:     #F59E0B   (amber)
--priority-medium:   #6C63D1   (brand purple)
--priority-low:      #22C55E   (green)
--priority-none:     #C8C7D8   (gray)

BACKGROUND SYSTEM (light mode only as specified)
--bg-app:      #F5F4FA   (overall app shell — very slightly purple-tinted white)
--bg-card:     #FFFFFF   (all cards, modals, bottom sheets)
--bg-elevated: #FFFFFF   (nav bars, headers — with subtle border below)
```

### Typography

Use **Inter** as the primary typeface. It is the gold standard for professional productivity UI — exceptionally legible at small sizes, extensive weight range, excellent number tabular figures.

```
FONT FAMILY
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif

TYPE SCALE
--text-xs:   11px / line-height: 16px   (timestamps, tags, micro labels)
--text-sm:   13px / line-height: 18px   (secondary info, subtitles, captions)
--text-base: 15px / line-height: 22px   (body, task titles, list items)
--text-md:   17px / line-height: 24px   (section headers, card titles)
--text-lg:   20px / line-height: 28px   (screen headers)
--text-xl:   24px / line-height: 32px   (dashboard stats, progress numbers)
--text-2xl:  30px / line-height: 38px   (hero numbers — streak count, completion %)

FONT WEIGHTS
--weight-regular: 400   (body text, descriptions)
--weight-medium:  500   (labels, list items, navigation)
--weight-semibold: 600  (section headers, card titles, task names)
--weight-bold:    700   (screen titles, CTA buttons, key stats)

NUMBER RENDERING
All numerical displays (dates, counts, percentages, times) MUST use:
font-variant-numeric: tabular-nums;
This ensures numbers align in lists and never cause layout jitter.
```

### Spacing System (8pt grid)

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px

SCREEN PADDING: 20px horizontal
CARD PADDING:   16px all sides
SECTION GAP:    24px
ITEM GAP:       8px between list items
```

### Border Radius

```
--radius-sm:   6px   (tags, chips, badges, input fields)
--radius-md:   10px  (cards, bottom sheets)
--radius-lg:   14px  (modals, large cards)
--radius-xl:   20px  (floating elements, profile images)
--radius-pill: 999px (toggle buttons, priority indicators)
```

### Elevation & Shadow

**Rule: Use borders, not shadows.** This creates the refined, professional look from Image 4 without the feminine softness of Images 1–3.

```css
/* Card border (all cards) */
border: 1px solid var(--color-gray-100);

/* Elevated elements (modals, dropdowns) */
border: 1px solid var(--color-gray-100);
box-shadow: 0 4px 16px rgba(28, 27, 46, 0.08), 0 1px 4px rgba(28, 27, 46, 0.04);

/* Active / focused elements */
box-shadow: 0 0 0 3px rgba(108, 99, 209, 0.18);  /* brand color ring */
```

---

## 🧩 Component Library

### 1. Task Item Component

This is the most important component — it appears hundreds of times. Get it perfect.

```
ANATOMY:
┌──────────────────────────────────────────────────┐
│ [◯] [PRIORITY DOT] Task Title              [TIME] │
│      #tag  #tag   [avatar stack]     [due badge]  │
└──────────────────────────────────────────────────┘

SPECIFICATIONS:
- Height: 72px for standard, 88px with subtask count
- Completion circle: 22px, stroke-width 2px, border-radius 50%
  - Unchecked: border: 2px solid --color-gray-200
  - Checked: filled with --color-primary-500, white checkmark inside
  - Animation: checkmark draws from left to right in 200ms, then task title gets
    strikethrough that animates in from left in 150ms, opacity fades to 0.45
- Priority indicator: 8px circle, hard-coded colors per priority level
  - Positioned LEFT of the task title text
- Task title: 15px semibold, --color-gray-900
  - Completed state: 15px regular, --color-gray-400, text-decoration: line-through
- Tags: pill chips, 11px medium, --color-primary-800 text on --color-primary-50 bg
  - Height: 20px, padding: 2px 8px, border-radius: pill
- Due date badge:
  - Overdue: red background (#FEF2F2), red text (#EF4444), 11px semibold
  - Today: amber background (#FFFBEB), amber text (#F59E0B), 11px semibold
  - Future: --color-gray-50 bg, --color-gray-400 text, 11px regular
- Swipe left: reveals [Complete] [Schedule] [Delete] action buttons
- Swipe right: reveals [Details] quick panel
- Long press: enters multi-select mode (subtle selection ring + checkboxes)
```

### 2. Habit Ring Component

Replace the feminine pastel circles from Images 1–3 with a precision ring system:

```
ANATOMY:
┌────────────────────┐
│     ╭─────╮        │
│    /  65%  \       │
│   │    ●   │       │
│    \       /       │
│     ╰─────╯        │
│   Drink Water      │
│   ● 5/7 days       │
└────────────────────┘

SPECIFICATIONS:
- Ring: SVG circle, 72px diameter, stroke-width 4px
- Background track: --color-gray-100
- Progress arc: --color-primary-500, stroke-linecap: round
- Center: percentage in 17px bold --color-gray-900
- Icon: 20px, centered, brand color
- Title: 12px medium, below ring, --color-gray-600
- Streak: 11px, green dot + "X day streak" text
- Animation: ring fills clockwise from 12 o'clock in 600ms cubic-bezier(0.34, 1.56, 0.64, 1)
  when screen loads or habit is marked complete
```

### 3. Priority Badge

```
SPECIFICATIONS (pill-shaped, consistent width per level):
- Urgent: 🔴 Background #FEF2F2, text #EF4444, "Urgent", 11px semibold
- High:   🟡 Background #FFFBEB, text #D97706, "High", 11px semibold
- Medium: 🟣 Background #EEEDFE, text #534AB7, "Medium", 11px semibold
- Low:    🟢 Background #F0FDF4, text #16A34A, "Low", 11px semibold

Dimensions: height 20px, padding 3px 8px, border-radius: pill
```

### 4. Bottom Navigation

Replace the bubble navigation from Images 1–3 with a professional tab bar:

```
ANATOMY:
┌──────────────────────────────────────────────────┐
│  ──────── (home indicator area) ───────          │
│ [Home] [Tasks] [Calendar] [Discover] [Profile]   │
└──────────────────────────────────────────────────┘

SPECIFICATIONS:
- Height: 83px total (34px tabs + 34px safe area + 15px padding)
- Background: #FFFFFF with top border: 1px solid --color-gray-100
- Active tab: icon in --color-primary-500, label in --color-primary-500, 
  with 2px --color-primary-500 top indicator line (NOT an active background pill)
- Inactive tab: icon in --color-gray-400, label in --color-gray-400
- Icon size: 24px (Lucide icons recommended)
- Label: 10px medium, font-variant: all-small-caps
- Plus FAB: 52px circle, --color-primary-500 background, white plus icon,
  centered between Calendar and Discover tabs,
  positioned 20px ABOVE the tab bar (floating)
  On tap: spring animation scales to 1.1x then back, 
  reveals action sheet with: New Task / New Habit / New Note / New Event
```

### 5. Section Headers

```
SPECIFICATIONS:
- Title: 20px bold, --color-gray-900
- Badge/count: 16px semibold, --color-primary-500 inside pill chip
  (--color-primary-50 background, 20px height)
- Right action: "See all" in 13px medium --color-primary-500
- Bottom margin: 12px before first list item
```

### 6. Progress Bar (Task Lists)

```
SPECIFICATIONS:
- Height: 4px, border-radius: 2px
- Background: --color-gray-100
- Fill: --color-primary-500, border-radius: 2px
- Text beneath: "X of Y completed" in 11px regular --color-gray-400
  aligned right to the bar
- Animation: width animates in on mount with 400ms ease-out
```

### 7. Input Fields

```
SPECIFICATIONS:
- Height: 48px
- Background: --color-gray-50
- Border: 1px solid --color-gray-100, border-radius: --radius-sm (6px)
- Focus: border-color: --color-primary-500, 
  box-shadow: 0 0 0 3px rgba(108, 99, 209, 0.15)
- Placeholder: --color-gray-200, 15px regular
- Text: --color-gray-900, 15px regular
- Label above: 13px semibold --color-gray-600, margin-bottom 6px
- Error state: border-color: --color-danger-400,
  error message in 12px --color-danger-400 below field
```

### 8. Primary Button

```
SPECIFICATIONS:
- Height: 52px (comfortable tap target)
- Background: --color-primary-500
- Border-radius: --radius-sm (6px)
- Text: 15px bold #FFFFFF, letter-spacing: 0.01em
- Pressed state: --color-primary-600, scale(0.98)
- Disabled state: --color-gray-100 background, --color-gray-400 text
- Loading state: spinner replaces text, same background
- Full-width on form screens
```

---

## 📱 Screen Architecture

### Screen 1: Home / Dashboard

**Purpose:** Deliver a command center overview — not a simple list.

```
LAYOUT (top to bottom):

━━━ STATUS BAR ━━━

━━━ TOP BAR ━━━
Left:  Hamburger menu icon (24px, --color-gray-900)
Center: Month + Year in 20px bold (e.g. "June 2026")
Right: [Search icon] [Avatar — 36px circle, initials or photo]

━━━ WEEK STRIP CALENDAR ━━━
7-day horizontal strip, centered on today
- Day label: 11px medium, --color-gray-400, ALL CAPS
- Date number: 17px semibold, --color-gray-600
- TODAY:
  - Date circle: 36px, --color-primary-500 background
  - Date number: white, 17px bold
  - Day label: --color-primary-500
- Days with tasks: show a 4px dot in --color-primary-200 beneath the number
- Tappable: selects that day, slides task list to show that day's tasks

━━━ DAILY PROGRESS BANNER ━━━ [★ SIGNATURE ELEMENT]
A horizontal card (full-width, card style):
- Left: Donut chart (80px) showing today's overall completion %
  - Multi-ring: outer ring = tasks, middle = habits, inner = goals
  - Center number: % in 20px bold --color-gray-900
- Right side: 3 stat pills in a row
  - "4/9 Tasks" with task icon
  - "2/3 Habits" with lightning icon  
  - "1 Goal" with flag icon
- Bottom: progress bar showing "You're 44% through today"
This gives users an at-a-glance power dashboard unavailable in competitor apps.

━━━ HABITS SECTION ━━━
Header: "Habits" + count badge + "+" button
Horizontal scroll row of Habit Ring Components (5-6 visible)

━━━ TASKS SECTION ━━━
Header: "Today's Tasks" + count badge + filter icon
- Group tasks by status: In Progress → Pending → Completed
- Completed group collapsed by default with "Show 3 completed" button
- Each group has a subtle section label (11px, --color-gray-400, uppercase)
- Task Item Components (full spec above)
- Empty state: Illustration + "All clear! Add a task to get started" + CTA button

━━━ NOTES SECTION ━━━
Header: "Notes" + "+" button
2-column grid of note cards (compact, truncated at 2 lines)

━━━ BOTTOM NAV ━━━ (floating FAB centered)
```

**Interaction highlights:**
- Pull-to-refresh with custom branded animation
- Scroll: top bar compresses to just avatar + month label (48px → 44px) with blur backdrop
- Task completion triggers confetti micro-animation for first 3 completions of day (then subtler)

---

### Screen 2: Tasks List Screen

```
LAYOUT:

━━━ TOP BAR ━━━
Back arrow / "Tasks" title / Filter + Sort icons (right)

━━━ SEGMENTED CONTROL ━━━
[Work] [Personal] [Goals] [+] — 3-pill selector
- Active pill: --color-primary-500 bg, white text
- Inactive: --color-gray-50 bg, --color-gray-600 text
- Container: --color-gray-100 bg, border-radius: --radius-pill, padding 3px

━━━ FILTER ROW ━━━ (horizontal scroll, compact)
[Today ×] [High Priority] [Incomplete] [#Work] — tag chips
- Active filter chip: --color-primary-50 bg, --color-primary-500 border + text, × to remove
- Inactive: --color-gray-50 bg, --color-gray-200 border

━━━ SORT CONTROL ━━━ (subtle, top of list)
"Sort by: Priority ▾" — 12px medium --color-gray-400, tapping opens action sheet

━━━ TASK LIST ━━━
Grouped by: Priority section headers OR Date section headers
(user-selectable)

━━━ ADD TASK ━━━
Floating "+ Add task" in --color-gray-200 style at bottom of list
(quick-add inline, not a full screen)

━━━ BOTTOM NAV ━━━
```

---

### Screen 3: Add / Edit Task Screen

```
LAYOUT (bottom sheet modal, not full screen — slides up to 90% height):

━━━ DRAG HANDLE ━━━ (4px × 36px pill, centered, --color-gray-200)

━━━ HEADER ━━━
"New Task" / "Edit Task" — 17px bold, centered
[Cancel] left, [Save] right (--color-primary-500, 15px semibold)

━━━ FORM FIELDS ━━━

[CATEGORY TABS]  Work | Personal | Goals | +
(Same segmented control as Tasks screen)

[TASK TITLE]
Placeholder: "What needs to be done?"
Large input: 20px semibold, no label, full-width, no border — just bottom divider
Auto-focuses on open, keyboard appears immediately

[DESCRIPTION]
Multiline, 15px regular, placeholder: "Add details..."
Collapses when empty, expands on tap

[DATE & TIME ROW]
Two-column row:
- Due Date: calendar icon + selected date / "Add date"
- Time: clock icon + selected time / "Add time"
Both open inline picker sheets

[PRIORITY ROW]
Label: "Priority"
4 pill buttons in a row: Urgent / High / Medium / Low
- Selected: filled background per color spec above
- Unselected: --color-gray-50 bg, --color-gray-200 border

[DIFFICULTY ROW] (differentiator from competitors)
Label: "Difficulty"
3 pills: Hard / Regular / Easy
Helps algorithm suggest optimal task order

[TAGS ROW]
Label: "Tags"
Horizontal chips with existing tags + "+" to add new
New tag: inline text input that creates chip on Enter/Space

[REMINDER]
Toggle row: bell icon + "Remind me" + toggle switch
Expands when toggled to show time picker

[REPEAT]
"Does not repeat ▾" → opens repeat picker sheet

[LIST ASSIGNMENT]
"Add to list ▾" → shows user's lists

[SUBTASKS]
"+ Add subtask" — creates inline subtask fields
Each subtask is a minimal input with a completion circle

━━━ SAVE BUTTON ━━━
52px primary button, full-width, "Save Task"
```

---

### Screen 4: Calendar Screen

```
LAYOUT:

━━━ TOP BAR ━━━
"< >" month navigation / Month Year title / Grid/Agenda toggle

━━━ CALENDAR GRID ━━━
Full month view (default) or week view (toggle)

DAY CELL DESIGN (not from Image 1's style — upgraded):
- Default: 13px semibold number, --color-gray-600
- Today: 34px circle, --color-primary-500 bg, white text
- Has tasks: up to 3 colored event dots beneath number
  (color matches task priority)
- Selected: gray ring around number
- Other month days: --color-gray-200 text

━━━ AGENDA LIST ━━━ (below calendar, scrollable)
Selected date shown as section header: "Wednesday, June 22"
Time-based task items:
- Time label: 11px --color-gray-400 (left column, 40px wide)
- Task card: right column, priority color left-border accent (3px)
- Duration shown as a connecting line on the left

━━━ BOTTOM NAV ━━━
```

---

### Screen 5: Add Habit Screen

```
LAYOUT (full screen):

━━━ TOP BAR ━━━
Back arrow / "Add Habit" title / "+" for custom icon

━━━ COVER IMAGE / ICON AREA ━━━
- Hero image (80px height) or gradient background
- Replace the photo style from Images 1–3 with:
  Gradient card (brand-colored gradient: --color-primary-400 → --color-primary-600)
  with a large centered emoji/icon (64px)
- "Change cover" text below, 12px --color-gray-400

━━━ FORM ━━━

[HABIT NAME]
Large 20px semibold input, "Name your habit" placeholder

[DESCRIPTION]
Multiline 15px, optional, "Why does this matter to you?"

[GOAL SECTION]
"Set a goal" header with checkbox to enable
- Start date picker
- Target count / unit (e.g. "8 glasses per day")

[REPEAT DAYS]
"Repeat days" header
7-day pill row: S M T W T F S
- Selected: --color-primary-500 bg, white text, border-radius: pill
- Unselected: --color-gray-50 bg, --color-gray-600 text

[REMINDER TOGGLE]
Bell icon + "Get reminders" + toggle
When on: time picker row appears below

[DIFFICULTY & CATEGORY]
Two select dropdowns: Difficulty | Category

━━━ SAVE BUTTON ━━━
52px primary button "Save Habit"
```

---

### Screen 6: Discover / Explore Screen

```
LAYOUT:

━━━ TOP BAR ━━━
Hamburger / "Discover" title / notification bell (with badge dot)

━━━ SEARCH BAR ━━━
Full-width, 46px, --color-gray-50 background, search icon left,
microphone icon right

━━━ TRENDING CATEGORIES ━━━
Header: "Trending" + "See all"
2×2 grid of category cards (NOT the soft look from Image 2 — upgraded):
Each card:
- Gradient background (different per category — not pink/pastel)
  Work: slate blue gradient
  Fitness: teal gradient
  Mindfulness: deep purple gradient
  Nutrition: green gradient
- Category icon (Lucide, 28px, white)
- Name: 15px semibold white
- Count: 13px regular white 70% opacity
- Subtle grain texture overlay at 5% opacity for depth

━━━ COMMUNITY HIGHLIGHTS ━━━
Header: "Community" + "See all"
Horizontal scroll row of compact user cards:
- Avatar (36px circle) + Name + Habit/Task count + Follow button
```

---

### Screen 7: Nutrition Screen

```
LAYOUT:

━━━ TOP BAR ━━━
Back arrow / "Nutrition" title / notification bell

━━━ WEEK STRIP ━━━ (same as Home)

━━━ MACRO SUMMARY CARD ━━━
Replace Image 2's multi-ring with a more readable layout:

┌────────────────────────────────────────┐
│ Today's Nutrition              78% ▰▰▰▰▱│
│                                         │
│ Calories: 1,420 / 1,800 kcal           │
│ ████████████░░░░░░░  79%               │
│                                         │
│ [Protein] [Carbs] [Fat]                 │
│  71g/150g  102g/200g  36g/67g          │
│  ████▓░░░  ██████▓░  ████▓░░           │
└────────────────────────────────────────┘

Each macro bar:
- Color: Protein = teal, Carbs = amber, Fat = coral
- Height: 6px, border-radius: 3px
- Text beneath bar: "Xg / Yg" in 12px

━━━ TODAY'S MEALS ━━━
Section header: "Today's Meals"
Grouped by: Breakfast / Lunch / Dinner / Snacks
Each group header: collapsible, shows total calories for group
Each meal item: food name + macros + calories (right-aligned) + food image thumbnail (40px)

━━━ ADD MEAL FAB ━━━
Bottom-right floating button (secondary style: outlined, not filled)
```

---

### Screen 8: Profile Screen

```
LAYOUT:

━━━ TOP BAR ━━━
Back / "Profile" / Share icon

━━━ PROFILE CARD ━━━
- Avatar: 72px circle with colored ring (--color-primary-400, 3px stroke)
- Name: 20px bold --color-gray-900
- Email: 13px regular --color-gray-400
- Edit button: pencil icon button (top-right of card)
- Stats row beneath: Tasks Completed | Habits | Streak | Days Active
  Each stat: number (20px bold --color-primary-500) + label (11px --color-gray-400)

━━━ SETTINGS LIST ━━━
Title: "Settings" — 17px bold, --color-gray-900, 16px padding

List of settings rows (each 52px tall):
┌───────────────────────────────────────────┐
│ [icon] Personal Information          >    │
│        Change name, email, password       │
├───────────────────────────────────────────┤
│ [icon] Notifications                 >    │
│        Manage notification preferences    │
├───────────────────────────────────────────┤
│ [icon] Privacy & Security            >    │
│        Terms of service                   │
├───────────────────────────────────────────┤
│ [icon] Contact Support               >    │
│        Get help from our team             │
└───────────────────────────────────────────┘

Row spec:
- Icon: 20px, inside 36px circle with --color-gray-50 background
- Title: 15px semibold --color-gray-900
- Subtitle: 12px --color-gray-400
- Chevron: --color-gray-300

━━━ LOGOUT ━━━
Last item, full-width text button:
- Text: "Log Out" in 15px semibold --color-danger-400
- No background, no border
- Has warning dialog on tap: "Are you sure you want to log out?"
```

---

## ✨ SIGNATURE ELEMENT: Triple-Ring Daily Command Center

This is the feature that makes TaskFlow stand apart from every competitor. It lives prominently on the Home screen and serves as the user's daily anchor point.

```
COMPONENT: DailyCommandCenter

VISUAL STRUCTURE:
Three concentric SVG rings on a white card:
  Outer ring (120px diameter): Tasks completion today
  Middle ring (92px diameter): Habits completion today  
  Inner ring (64px diameter): Goal progress today

Each ring:
- Background track: --color-gray-100
- Progress arc: respective color per ring
  Tasks = --color-primary-500
  Habits = --color-success-400
  Goals = --color-warning-400
- Stroke-width: 8px outer, 7px middle, 6px inner
- Linecap: round

Center of rings:
- Overall percentage (large number, 24px bold)
- "Today" label beneath (11px --color-gray-400)

Right of rings: 3 stat items vertically:
  ● Tasks      4/9 completed
  ● Habits     2/3 on track  
  ● Goals      1 active

Each stat: 
- Colored dot (8px) matching ring color
- Label: 13px regular --color-gray-600
- Count: 13px semibold --color-gray-900

Bottom of card:
- Thin progress bar (4px): overall day completion
- Motivational label that changes based on %:
  0-25%: "Let's get started 💪"
  26-50%: "Great momentum! Keep going →"
  51-75%: "Over halfway there! You're crushing it"
  76-99%: "Almost done! Finish strong 🎯"
  100%:   "Perfect day! 🏆 All tasks complete"

ANIMATION:
- On screen load: each ring animates from 0 to current value with 700ms
  easing: cubic-bezier(0.34, 1.56, 0.64, 1) — slight overshoot for life
- Stagger: outer starts at 0ms, middle at 100ms, inner at 200ms
- On task/habit completion: the relevant ring pulses (scale 1.0 → 1.05 → 1.0, 
  300ms) and the arc animates forward to new value
```

---

## 🚀 DIFFERENTIATING FEATURES (implement these to stand out)

### 1. Smart Task Ordering Algorithm
Based on user-set Priority + Difficulty fields, TaskFlow auto-suggests the optimal order to complete tasks (tackle high-priority + easy tasks first to build momentum). Show a "TaskFlow suggests" section above the task list on the Home screen when 3+ tasks are pending.

```
UI: 
Header: "💡 Suggested Order" in 13px italic --color-gray-400
Numbered list of task names with reasoning tooltip
Tooltip: "High priority + Easy = Start here"
```

### 2. Focus Mode (Deep Work Timer)
Tap any task → task detail screen → "Focus" button launches:
- Full-screen minimal view
- Pomodoro-style timer (customizable: 25/5, 50/10, or custom)
- Current task title prominently displayed
- "Skip break" and "End session" buttons
- Session log tracks focused time per task

```
UI:
Background: gradient from --color-primary-900 to #0F0E1A (dark, immersive)
Timer: 72px countdown, white, tabular-nums
Task name: 20px semibold, white 80%
Pause/Play: 64px circle button, --color-primary-500
Ring border animation around timer as it counts down
```

### 3. Habit Chain Visualization
On the Habit detail screen, show a GitHub-style contribution grid for the past 12 weeks:
- Each cell = 1 day
- Color intensity = completion (no data = --color-gray-100, partial = --color-primary-200, complete = --color-primary-500)
- Tap any cell to see what was logged that day
- Current streak prominently: "🔥 14 day streak"

### 4. Weekly Debrief Card (Sundays)
Every Sunday evening, push a card to the home screen top:
"This week: You completed 47 tasks, maintained 3/4 habits, and achieved 1 goal. Your most productive day was Tuesday. Next week, let's aim for 50 tasks!"
Tapping opens a full Weekly Analytics screen.

### 5. Tag-Based Context Switching
Users can switch the entire Home screen view by tapping a tag:
- Home shows "All"
- Tap "#Work" → all widgets, tasks, and habits filter to work context
- Tap "#Health" → everything filters to health context
Shows a colored top border stripe matching the tag's color when filtered.

---

## 🎭 Micro-Interactions & Animation Specification

### Task Completion
```
1. Tap completion circle
2. Circle border animates to primary color (100ms)
3. Circle fills with primary color, white checkmark draws in (150ms)
4. Task title gets strikethrough line that draws from left (150ms)
5. Title fades to 45% opacity (150ms)
6. Subtle spring bounce on the row (scale 0.99 → 1.0, 200ms)
7. If it's the last task: progress bar fills fully + motivational toast appears
```

### Habit Ring Tap
```
1. Tap ring
2. Modal slides up with day selector
3. Mark day as complete: ring arc animates to new value (400ms, spring)
4. If streak milestone (7, 14, 30 days): confetti burst from ring center
```

### FAB (Floating Action Button) Expansion
```
1. Tap FAB (+)
2. FAB rotates 45° (transforms to ×) over 200ms
3. Background dims to rgba(28, 27, 46, 0.4) fade-in 200ms
4. 4 action items rise from FAB position with stagger (50ms each):
   → New Task / New Habit / New Note / New Event
5. Each item: icon circle + label, slides up and fades in
6. Tap action: items collapse back, FAB rotates back, navigate to screen
```

### Swipe Actions on Task
```
Swipe left reveals:
- [Complete]: green (#22C55E) background, white checkmark icon
- [Schedule]: amber background, calendar icon
- [Delete]: red (#EF4444) background, trash icon

Swipe right reveals:
- [Details]: primary color background, info icon → opens task detail

Each action has haptic feedback (impact.medium)
```

### Bottom Sheet Open
```
Bottom sheet slides up with:
- Spring animation: initial velocity from swipe if gesture-triggered
- Backdrop appears simultaneously
- First field auto-focuses after 150ms delay
```

---

## 📐 Layout Consistency Rules

1. **No screen should have more than 5 distinct visual "zones"** (header, content sections, input, action, nav)
2. **All interactive elements minimum 44×44pt touch target** (even if visual size is smaller, use padding)
3. **Loading states**: every async operation shows a skeleton screen — never a spinner overlay on content
4. **Empty states**: every list or section must have an empty state with illustration + clear CTA
5. **Error states**: form errors appear inline beneath the field (never as alerts), in --color-danger-400
6. **Modals and sheets**: always dismissible by tapping backdrop or swipe-down gesture
7. **Keyboard avoidance**: all input screens use KeyboardAvoidingView, content scrolls above keyboard
8. **Safe areas**: all content respects top (status bar) and bottom (home indicator) safe areas

---

## 🔤 Copy & Voice Guidelines

**App voice:** Direct, motivating, never cutesy. Think productivity coach, not friend.

| Context | ❌ Don't use | ✅ Use instead |
|---|---|---|
| Empty task list | "Nothing here yet!" | "No tasks today. Add one to get started." |
| Habit streak end | "Oops! Streak broken 😢" | "Streak reset. Today is a new chance." |
| Task completed | "Yay! You did it! 🎉" | "Done. 4 remaining today." |
| Overdue task | "You're late on this..." | "Overdue by 2 days" |
| Onboarding | "Let's get started bestie!" | "Set up your first task list." |

---

## 🏗️ Tech Implementation Notes for Cursor AI

### React Native Specific
- Use `react-navigation` v6 for navigation
- Use `react-native-reanimated` v3 for ALL animations (never Animated API for complex animations)
- Use `react-native-gesture-handler` for all swipe interactions
- SVG components via `react-native-svg`
- Use `@shopify/flash-list` instead of FlatList for performance
- Bottom sheets via `@gorhom/bottom-sheet`
- Calendar via `react-native-calendars` with custom theme

### State Management
- Zustand for global app state
- React Query / TanStack Query for server state + caching

### Design Tokens Implementation
```javascript
// theme.js — single source of truth
export const colors = {
  primary: {
    50:  '#EEEDFE',
    100: '#D4D2F8',
    200: '#AFA9EC',
    400: '#7F77DD',
    500: '#6C63D1',  // DEFAULT
    600: '#534AB7',
    800: '#3C3489',
    900: '#26215C',
  },
  gray: {
    0:   '#FFFFFF',
    25:  '#F9F9FB',
    50:  '#F1F0F6',
    100: '#E4E3EE',
    200: '#C8C7D8',
    400: '#8E8DA4',
    600: '#5A5970',
    900: '#1C1B2E',
  },
  // ... etc
}

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 8: 32, 10: 40, 12: 48, 16: 64
}

export const radius = {
  sm: 6, md: 10, lg: 14, xl: 20, pill: 999
}

export const typography = {
  xs:   { fontSize: 11, lineHeight: 16 },
  sm:   { fontSize: 13, lineHeight: 18 },
  base: { fontSize: 15, lineHeight: 22 },
  md:   { fontSize: 17, lineHeight: 24 },
  lg:   { fontSize: 20, lineHeight: 28 },
  xl:   { fontSize: 24, lineHeight: 32 },
  '2xl':{ fontSize: 30, lineHeight: 38 },
}
```

### Font Loading
```javascript
// Load Inter font family in app entry point
import * as Font from 'expo-font';
await Font.loadAsync({
  'Inter-Regular':   require('./assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium':    require('./assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold':  require('./assets/fonts/Inter-SemiBold.ttf'),
  'Inter-Bold':      require('./assets/fonts/Inter-Bold.ttf'),
});
```

### Icon System
Use **Lucide React Native** as the icon library:
```bash
npm install lucide-react-native react-native-svg
```
Key icons used:
- Home: `<Home />`
- Tasks: `<CheckSquare />`
- Calendar: `<Calendar />`
- Discover: `<Compass />`
- Profile: `<User />`
- Add: `<Plus />`
- Priority: `<Flag />`
- Habit: `<Zap />`
- Timer: `<Timer />`
- Delete: `<Trash2 />`
- Filter: `<SlidersHorizontal />`

---

## ✅ Quality Checklist (verify before every screen)

- [ ] All text uses Inter at defined type scale sizes
- [ ] All colors from the defined token palette only (no hardcoded hex outside theme.js)
- [ ] Touch targets minimum 44×44pt
- [ ] Loading/skeleton state exists for every async section
- [ ] Empty state exists for every list
- [ ] Swipe actions work on task items
- [ ] Animations use react-native-reanimated
- [ ] Font variant tabular-nums on all number displays
- [ ] Safe area insets respected top and bottom
- [ ] Keyboard avoidance on all form screens
- [ ] Priority system colors consistent across all screens
- [ ] Bottom navigation active state uses top indicator line (not pill background)
- [ ] FAB is 52px, positioned 20px above tab bar, expands to 4 actions
- [ ] Triple-ring Daily Command Center present and animated on Home screen
- [ ] No drop shadows except on elevated overlays (modals, dropdowns)
- [ ] All borders 1px solid --color-gray-100 (never 2px on standard elements)

---

*This document defines the complete design system for TaskFlow v1.0.*
*All implementation decisions should trace back to a principle defined here.*
*When in doubt: favor clarity, hierarchy, and function over decoration.*

---

## 🔭 Future Works (Post-v1.0)

The following features are intentionally out of scope for the current build and should not be implemented or referenced in any v1.0 screen. They are logged here so the design system can accommodate them without breaking changes when the time comes.

### Upgrade to Pro / Premium Tier
- Gated feature model: unlimited habits, advanced analytics, custom themes
- Premium card UI on the Profile screen (gradient --color-primary-500 → --color-primary-800, crown icon, Upgrade CTA)
- Paywall screens and subscription management flow
- Visual differentiation for Pro users (subtle crown badge on avatar)
- Design note: the color token system already supports this — `--color-primary-gradient` reserved for the premium surface. No token changes needed when this ships.
