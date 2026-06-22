const normalizeTag = (raw) => {
  const t = raw.trim();
  if (!t) return '';
  return t.startsWith('#') ? t : `#${t}`;
};

const CATEGORY_TAGS = {
  work: [
    { tag: '#DeepWork', reason: 'Focus block' },
    { tag: '#Meeting', reason: 'Sync or call' },
    { tag: '#Code', reason: 'Development' },
    { tag: '#Design', reason: 'UI / UX' },
    { tag: '#Review', reason: 'Feedback loop' },
    { tag: '#Sprint', reason: 'Iteration' },
    { tag: '#Docs', reason: 'Documentation' },
    { tag: '#Email', reason: 'Comms' },
    { tag: '#Planning', reason: 'Roadmap' },
    { tag: '#OKRs', reason: 'Quarterly goals' },
  ],
  personal: [
    { tag: '#Fitness', reason: 'Movement' },
    { tag: '#Health', reason: 'Wellness' },
    { tag: '#Errands', reason: 'To-dos' },
    { tag: '#Family', reason: 'Home life' },
    { tag: '#Shopping', reason: 'Purchases' },
    { tag: '#SelfCare', reason: 'Recovery' },
    { tag: '#Reading', reason: 'Books' },
    { tag: '#Cooking', reason: 'Meals' },
    { tag: '#Travel', reason: 'Trips' },
    { tag: '#Finance', reason: 'Money' },
  ],
  goals: [
    { tag: '#Goals', reason: 'Targets' },
    { tag: '#Growth', reason: 'Skill building' },
    { tag: '#Learning', reason: 'Study' },
    { tag: '#Habits', reason: 'Routines' },
    { tag: '#Milestones', reason: 'Checkpoints' },
    { tag: '#Reflection', reason: 'Review' },
    { tag: '#Vision', reason: 'Long-term' },
    { tag: '#Accountability', reason: 'Track progress' },
  ],
};

const PRIORITY_TAGS = {
  urgent: [{ tag: '#ASAP', reason: 'Time-sensitive' }, { tag: '#Blocker', reason: 'Unblocks others' }],
  high: [{ tag: '#Important', reason: 'High impact' }],
  medium: [{ tag: '#ThisWeek', reason: 'Near-term' }],
  low: [{ tag: '#Backlog', reason: 'When time allows' }, { tag: '#Someday', reason: 'No rush' }],
};

const KEYWORD_TAG_RULES = [
  { keywords: ['design', 'figma', 'ui', 'ux', 'wireframe', 'prototype'], tags: ['#Design', '#Review'] },
  { keywords: ['code', 'refactor', 'bug', 'api', 'test', 'deploy', 'build'], tags: ['#Code', '#Tests'] },
  { keywords: ['meeting', 'sync', 'standup', 'call', '1:1', 'interview'], tags: ['#Meeting', '#Planning'] },
  { keywords: ['presentation', 'slides', 'deck', 'pitch', 'demo'], tags: ['#Presentation', '#OKRs'] },
  { keywords: ['read', 'book', 'chapter', 'study', 'course', 'learn'], tags: ['#Reading', '#Learning'] },
  { keywords: ['run', 'gym', 'workout', 'yoga', 'walk', 'exercise'], tags: ['#Fitness', '#Health'] },
  { keywords: ['shop', 'grocery', 'buy', 'pick up', 'errand'], tags: ['#Errands', '#Shopping'] },
  { keywords: ['email', 'inbox', 'reply', 'follow up', 'message'], tags: ['#Email', '#Comms'] },
  { keywords: ['doc', 'readme', 'write', 'document', 'spec'], tags: ['#Docs', '#Writing'] },
  { keywords: ['goal', 'okr', 'quarter', 'milestone', 'target'], tags: ['#Goals', '#Milestones'] },
  { keywords: ['review', 'feedback', 'critique', 'audit'], tags: ['#Review', '#Quality'] },
  { keywords: ['plan', 'roadmap', 'strategy', 'brainstorm'], tags: ['#Planning', '#Strategy'] },
];

const SUBTASK_TEMPLATES = [
  {
    id: 'presentation',
    label: 'Presentation prep',
    icon: 'slideshow',
    keywords: ['presentation', 'slides', 'deck', 'pitch', 'demo', 'okr'],
    steps: ['Gather metrics & data', 'Outline key narrative', 'Draft slides', 'Add visuals & charts', 'Rehearse timing', 'Send pre-read to stakeholders'],
  },
  {
    id: 'code-feature',
    label: 'Ship a feature',
    icon: 'code',
    keywords: ['code', 'feature', 'implement', 'build', 'api', 'module', 'refactor'],
    steps: ['Clarify acceptance criteria', 'Write or update tests', 'Implement core logic', 'Handle edge cases', 'Self-review diff', 'Open PR & address feedback'],
  },
  {
    id: 'meeting',
    label: 'Meeting prep',
    icon: 'groups',
    keywords: ['meeting', 'sync', 'standup', '1:1', 'interview', 'workshop'],
    steps: ['Define agenda & outcomes', 'Pull relevant context', 'Prepare talking points', 'Share pre-read materials', 'Capture action items after'],
  },
  {
    id: 'design-review',
    label: 'Design review',
    icon: 'brush',
    keywords: ['design', 'figma', 'ui', 'ux', 'wireframe', 'mockup'],
    steps: ['Audit against design system', 'Check responsive states', 'Validate accessibility', 'Document open questions', 'Share feedback summary'],
  },
  {
    id: 'research',
    label: 'Research & decide',
    icon: 'search',
    keywords: ['research', 'explore', 'investigate', 'compare', 'evaluate', 'decide'],
    steps: ['Define decision criteria', 'List options to compare', 'Gather evidence', 'Summarize trade-offs', 'Make recommendation', 'Share decision log'],
  },
  {
    id: 'writing',
    label: 'Write & publish',
    icon: 'edit-note',
    keywords: ['write', 'doc', 'readme', 'article', 'blog', 'report', 'documentation'],
    steps: ['Outline structure', 'Draft first version', 'Add examples & links', 'Proofread & edit', 'Get peer review', 'Publish & announce'],
  },
  {
    id: 'errands',
    label: 'Errand run',
    icon: 'shopping-bag',
    keywords: ['shop', 'grocery', 'errand', 'pick up', 'buy', 'store'],
    steps: ['Make shopping list', 'Check store hours & route', 'Gather bags / coupons', 'Shop & check off items', 'Put groceries away'],
  },
  {
    id: 'fitness',
    label: 'Workout session',
    icon: 'fitness-center',
    keywords: ['run', 'gym', 'workout', 'yoga', 'exercise', 'training'],
    steps: ['Lay out gear & water', 'Warm up 5–10 min', 'Main workout block', 'Cool down & stretch', 'Log session & how you felt'],
  },
  {
    id: 'weekly-planning',
    label: 'Weekly planning',
    icon: 'calendar-today',
    keywords: ['weekly', 'plan', 'goals', 'review', 'retrospective', 'prioritize'],
    steps: ['Review last week wins & misses', 'Clear inbox & loose ends', 'Pick top 3 priorities', 'Block calendar time', 'Set one stretch goal'],
  },
  {
    id: 'launch',
    label: 'Launch checklist',
    icon: 'rocket-launch',
    keywords: ['launch', 'release', 'ship', 'go-live', 'rollout'],
    steps: ['Finalize release notes', 'Run smoke tests', 'Prepare rollback plan', 'Notify stakeholders', 'Monitor metrics post-launch', 'Hold retro'],
  },
];

const DIFFICULTY_SUBTASKS = {
  hard: ['Break into smaller chunks', 'Identify blockers early', 'Schedule deep-work block'],
  regular: ['Set a clear done definition', 'Block time on calendar'],
  easy: ['Quick win — do it first', 'Batch with similar tasks'],
};

const PRIORITY_SUBTASKS = {
  urgent: ['Do this before other work', 'Notify anyone waiting on this'],
  high: ['Schedule dedicated focus time'],
  low: ['Park until higher priorities clear'],
};

function textBlob({ title = '', description = '' }) {
  return `${title} ${description}`.toLowerCase();
}

function countTagUsage(tasks) {
  const counts = {};
  for (const task of tasks) {
    for (const tag of task.tags ?? []) {
      const n = normalizeTag(tag);
      counts[n] = (counts[n] ?? 0) + 1;
    }
  }
  return counts;
}

function collectSubtaskTitles(tasks, { category, tags }) {
  const titles = [];
  const tagSet = new Set((tags ?? []).map(normalizeTag));
  for (const task of tasks) {
    const taskTags = (task.tags ?? []).map(normalizeTag);
    const tagOverlap = taskTags.some((t) => tagSet.has(t));
    const sameCategory = task.category === category;
    if (!sameCategory && !tagOverlap) continue;
    for (const st of task.subtasks ?? []) {
      if (st.title?.trim()) titles.push({ title: st.title.trim(), source: task.title });
    }
  }
  return titles;
}

function uniqueByTag(items, limit = 12) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const tag = normalizeTag(item.tag);
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push({ ...item, tag });
    if (out.length >= limit) break;
  }
  return out;
}

function matchesQuery(tag, query) {
  if (!query?.trim()) return true;
  const q = query.trim().toLowerCase().replace(/^#/, '');
  const t = tag.toLowerCase().replace(/^#/, '');
  return t.includes(q);
}

export function getTagSuggestionGroups({
  tasks = [],
  category = 'work',
  priority = 'medium',
  title = '',
  description = '',
  selectedTags = [],
  query = '',
}) {
  const selected = new Set(selectedTags.map(normalizeTag));
  const blob = textBlob({ title, description });
  const hasWrittenContext = blob.trim().length > 2;
  const usage = countTagUsage(tasks);
  const groups = [];

  const recentFromHistory = Object.entries(usage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, reason: `Used ${count}×`, score: 100 + count }));

  if (recentFromHistory.length) {
    groups.push({ id: 'history', title: 'From your tasks', items: recentFromHistory });
  }

  const keywordHits = [];
  if (hasWrittenContext) {
    for (const rule of KEYWORD_TAG_RULES) {
      if (rule.keywords.some((kw) => blob.includes(kw))) {
        for (const tag of rule.tags) {
          keywordHits.push({ tag, reason: 'Matches title', score: 95 });
        }
      }
    }
    if (keywordHits.length) {
      groups.push({ id: 'context', title: 'Based on what you wrote', items: keywordHits });
    }
  }

  const showCategoryPresets = !keywordHits.length || recentFromHistory.length < 3;
  if (showCategoryPresets) {
    const categoryItems = (CATEGORY_TAGS[category] ?? CATEGORY_TAGS.work)
      .slice(0, hasWrittenContext ? 4 : 3)
      .map((item, i) => ({ ...item, score: 80 - i }));
    groups.push({
      id: 'category',
      title: `Suggested for ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      items: categoryItems,
    });
  }

  const showPriorityTags =
    priority === 'urgent' ||
    priority === 'high' ||
    (hasWrittenContext && priority !== 'medium');
  if (showPriorityTags) {
    const priorityItems = (PRIORITY_TAGS[priority] ?? []).map((item, i) => ({
      ...item,
      score: 70 - i,
    }));
    if (priorityItems.length) {
      groups.push({ id: 'priority', title: 'For this priority', items: priorityItems });
    }
  }

  const flat = [];
  for (const group of groups) {
    for (const item of group.items) {
      if (!matchesQuery(item.tag, query)) continue;
      if (selected.has(normalizeTag(item.tag))) continue;
      flat.push({ ...item, groupId: group.id, groupTitle: group.title });
    }
  }

  flat.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const topSuggestions = uniqueByTag(flat, 8);

  const grouped = [];
  const seenGroups = new Set();
  for (const item of topSuggestions) {
    if (!seenGroups.has(item.groupId)) {
      seenGroups.add(item.groupId);
      grouped.push({
        id: item.groupId,
        title: item.groupTitle,
        items: topSuggestions.filter((t) => t.groupId === item.groupId),
      });
    }
  }

  return { groups: grouped, flat: topSuggestions };
}

export function getSubtaskSuggestionGroups({
  tasks = [],
  category = 'work',
  priority = 'medium',
  difficulty = 'regular',
  title = '',
  description = '',
  existingSubtasks = [],
  query = '',
  tags = [],
}) {
  const existingTitles = new Set(
    existingSubtasks.map((s) => s.title.trim().toLowerCase()).filter(Boolean)
  );
  const blob = textBlob({ title, description });
  const q = query.trim().toLowerCase();

  const templates = SUBTASK_TEMPLATES.map((tpl) => {
    const keywordScore = tpl.keywords.reduce(
      (acc, kw) => (blob.includes(kw) ? acc + 10 : acc),
      0
    );
    const categoryBoost =
      (category === 'work' && ['code-feature', 'meeting', 'presentation', 'design-review', 'launch'].includes(tpl.id)) ||
      (category === 'personal' && ['errands', 'fitness'].includes(tpl.id)) ||
      (category === 'goals' && ['weekly-planning', 'research'].includes(tpl.id))
        ? 5
        : 0;
  return {
      ...tpl,
      score: keywordScore + categoryBoost,
      remainingSteps: tpl.steps.filter((step) => !existingTitles.has(step.toLowerCase())),
    };
  })
    .filter((tpl) => tpl.remainingSteps.length > 0)
    .sort((a, b) => b.score - a.score);

  const hasWrittenContext = blob.trim().length > 2;
  const hasTagContext = (tags ?? []).length > 0;

  const matchedTemplates = hasWrittenContext
    ? templates.filter((t) => t.score > 0).slice(0, 3)
    : [];
  const templateList = matchedTemplates;

  const fromHistory =
    hasWrittenContext || hasTagContext
      ? collectSubtaskTitles(tasks, { category, tags })
          .filter((item) => !existingTitles.has(item.title.toLowerCase()))
          .reduce((acc, item) => {
            const key = item.title.toLowerCase();
            if (!acc.seen.has(key)) {
              acc.seen.add(key);
              acc.list.push({ title: item.title, reason: `From "${item.source}"`, score: 60 });
            }
            return acc;
          }, { seen: new Set(), list: [] })
          .list.slice(0, 4)
      : [];

  const contextualSingles = hasWrittenContext
    ? [
        ...(DIFFICULTY_SUBTASKS[difficulty] ?? []).map((stepTitle, i) => ({
          title: stepTitle,
          reason: `${difficulty} task`,
          score: 40 - i,
        })),
        ...(PRIORITY_SUBTASKS[priority] ?? []).map((stepTitle, i) => ({
          title: stepTitle,
          reason: `${priority} priority`,
          score: 35 - i,
        })),
      ].filter((item) => !existingTitles.has(item.title.toLowerCase()))
    : [];

  const quickAdds = [...fromHistory, ...contextualSingles]
    .filter((item) => !q || item.title.toLowerCase().includes(q))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const groups = [];
  if (templateList.length) {
    groups.push({
      id: 'templates',
      title: blob.trim() ? 'Checklists for this task' : 'Quick checklists',
      templates: templateList,
    });
  }
  if (quickAdds.length) {
    groups.push({
      id: 'quick',
      title: 'Suggested steps',
      items: quickAdds,
    });
  }

  return { groups, templates: templateList, quickAdds };
}

export { normalizeTag };
