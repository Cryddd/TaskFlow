import { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTasks, useCreateTask, useUpdateTask } from '../lib/hooks/useTasks';
import { colors, brand, fonts, spacing, radius, priorityBg, priorityText } from '../lib/theme';
import { showToast } from '../lib/toast';
import {
  getTagSuggestionGroups,
  getSubtaskSuggestionGroups,
  normalizeTag,
} from '../lib/taskSuggestions';
import PrimaryButton from '../components/ui/PrimaryButton';
import SegmentedControl from '../components/ui/SegmentedControl';
import MonthCalendarPicker from '../components/ui/MonthCalendarPicker';

const SUBTASK_MODES = [
  { label: 'Custom', value: 'manual' },
  { label: 'Suggestions', value: 'suggestions' },
];

const CATEGORIES = [
  { label: 'Work',     value: 'work'     },
  { label: 'Personal', value: 'personal' },
  { label: 'Goals',    value: 'goals'    },
];

const PRIORITIES = [
  { label: 'Urgent', value: 'urgent' },
  { label: 'High',   value: 'high'   },
  { label: 'Medium', value: 'medium' },
  { label: 'Low',    value: 'low'    },
];

const DIFFICULTIES = [
  { label: 'Hard',    value: 'hard'    },
  { label: 'Regular', value: 'regular' },
  { label: 'Easy',    value: 'easy'    },
];

const fmt = (d) => d.toISOString().split('T')[0];

const parseReminderTime = (timeStr) => {
  const d = new Date();
  if (!timeStr) {
    d.setHours(9, 0, 0, 0);
    return d;
  }
  const [h, m] = timeStr.split(':').map(Number);
  d.setHours(h || 9, m || 0, 0, 0);
  return d;
};

const formatDisplayDate = (dateStr) => {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatReminderTime = (d) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export default function TaskNewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: tasks = [] } = useTasks();
  const createTaskMut = useCreateTask();
  const updateTaskMut = useUpdateTask();

  const existing = id ? tasks.find((t) => t.id === id) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState(existing?.category ?? 'work');
  const [priority, setPriority] = useState(existing?.priority ?? 'medium');
  const [difficulty, setDifficulty] = useState(existing?.difficulty ?? 'regular');
  const [tags, setTags] = useState(existing?.tags ?? []);
  const [newTag, setNewTag] = useState('');
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? fmt(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [remind, setRemind] = useState(existing?.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(() => parseReminderTime(existing?.reminderTime));
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [subtasks, setSubtasks] = useState(existing?.subtasks ?? []);
  const [subtaskMode, setSubtaskMode] = useState(
    existing?.subtasks?.length ? 'manual' : 'manual'
  );
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(!id);

  const titleRef = useRef(null);

  useEffect(() => {
    if (!id || !existing || hydrated) return;
    setTitle(existing.title ?? '');
    setDescription(existing.description ?? '');
    setCategory(existing.category ?? 'work');
    setPriority(existing.priority ?? 'medium');
    setDifficulty(existing.difficulty ?? 'regular');
    setTags(existing.tags ?? []);
    setDueDate(existing.dueDate ?? fmt(new Date()));
    setRemind(existing.reminderEnabled ?? false);
    setReminderTime(parseReminderTime(existing.reminderTime));
    setSubtasks(existing.subtasks ?? []);
    setSubtaskMode(existing.subtasks?.length ? 'manual' : 'manual');
    setHydrated(true);
  }, [id, existing, hydrated]);

  const handleSave = async () => {
    if (!title.trim()) {
      showToast.saveFailed('Add a task title to continue');
      titleRef.current?.focus();
      return;
    }
    if (loading || createTaskMut.isPending || updateTaskMut.isPending) return;

    setLoading(true);
    const payload = {
      title: title.trim(),
      description,
      category,
      priority,
      difficulty,
      tags,
      dueDate,
      subtasks,
      reminderEnabled: remind,
      reminderTime: remind ? formatReminderTime(reminderTime) : null,
    };

    try {
      if (existing) {
        await updateTaskMut.mutateAsync({ id: existing.id, updates: payload });
        showToast.taskUpdated();
      } else {
        await createTaskMut.mutateAsync({ ...payload, dueTime: null });
        showToast.taskCreated();
      }
      router.back();
    } catch {
      // Mutation hooks already surface the Supabase error via toast.
    } finally {
      setLoading(false);
    }
  };

  const tagSuggestions = useMemo(
    () =>
      getTagSuggestionGroups({
        tasks,
        category,
        priority,
        title,
        description,
        selectedTags: tags,
        query: newTag,
      }),
    [tasks, category, priority, title, description, tags, newTag]
  );

  const subtaskSuggestions = useMemo(
    () =>
      getSubtaskSuggestionGroups({
        tasks,
        category,
        priority,
        difficulty,
        title,
        description,
        existingSubtasks: subtasks,
        query: newSubtask,
        tags,
      }),
    [tasks, category, priority, difficulty, title, description, subtasks, newSubtask, tags]
  );

  const selectTag = (raw) => {
    const t = normalizeTag(raw);
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setNewTag('');
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    selectTag(newTag);
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const addSubtaskTitle = (titleText) => {
    const trimmed = titleText.trim();
    if (!trimmed) return;
    const exists = subtasks.some((s) => s.title.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast.saveFailed('That step is already on your checklist');
      return;
    }
    setSubtasks([
      ...subtasks,
      { id: `st${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: trimmed, completed: false },
    ]);
    setNewSubtask('');
  };

  const addSubtask = () => addSubtaskTitle(newSubtask);

  const addSubtaskTemplate = (steps) => {
    const existing = new Set(subtasks.map((s) => s.title.toLowerCase()));
    const fresh = steps.filter((step) => !existing.has(step.toLowerCase()));
    if (!fresh.length) return;
    const stamped = fresh.map((step, i) => ({
      id: `st${Date.now()}-${i}`,
      title: step,
      completed: false,
    }));
    setSubtasks([...subtasks, ...stamped]);
    setNewSubtask('');
  };

  const toggleSubtask = (stId) => {
    setSubtasks(subtasks.map((s) => s.id === stId ? { ...s, completed: !s.completed } : s));
  };

  const removeSubtask = (stId) => setSubtasks(subtasks.filter((s) => s.id !== stId));

  const hasSubtaskSuggestions =
    subtaskSuggestions.templates.length > 0 || subtaskSuggestions.quickAdds.length > 0;
  const showSuggestionPanel = subtaskMode === 'suggestions';
  const showManualPanel = subtaskMode === 'manual';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existing ? 'Edit Task' : 'New Task'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={!title.trim()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.save, !title.trim() && styles.saveDisabled]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Category */}
          <View style={styles.field}>
            <SegmentedControl
              options={CATEGORIES}
              value={category}
              onChange={setCategory}
              equalWidth
            />
          </View>

          {/* Title */}
          <View style={[styles.field, styles.titleField]}>
            <TextInput
              ref={titleRef}
              style={styles.titleInput}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.gray[200]}
              value={title}
              onChangeText={setTitle}
              autoFocus
              multiline
              returnKeyType="next"
            />
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.field}>
            <TextInput
              style={styles.descInput}
              placeholder="Add details…"
              placeholderTextColor={colors.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.divider} />

          {/* Due Date */}
          <TouchableOpacity
            style={styles.rowField}
            onPress={() => setShowDatePicker((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={styles.rowLabelWrap}>
              <MaterialIcons name="event" size={18} color={colors.gray[900]} />
              <Text style={styles.rowLabel}>Due Date</Text>
            </View>
            <View style={styles.rowValueWrap}>
              <Text style={styles.rowValue}>{formatDisplayDate(dueDate)}</Text>
              <MaterialIcons
                name={showDatePicker ? 'expand-less' : 'expand-more'}
                size={18}
                color={colors.gray[400]}
              />
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <View style={styles.datePickerWrap}>
              <MonthCalendarPicker
                selectedDate={dueDate}
                onSelectDate={(d) => {
                  setDueDate(d);
                  setShowDatePicker(false);
                }}
              />
            </View>
          )}

          <View style={styles.divider} />

          {/* Priority */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.pillRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityPill,
                    priority === p.value
                      ? { backgroundColor: priorityBg[p.value], borderColor: priorityText[p.value] }
                      : { backgroundColor: colors.bg.subtle, borderColor: colors.gray[200] },
                  ]}
                  onPress={() => setPriority(p.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, { color: priority === p.value ? priorityText[p.value] : colors.gray[600] }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Difficulty */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Difficulty</Text>
            <View style={styles.pillRow}>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[
                    styles.diffPill,
                    difficulty === d.value
                      ? { backgroundColor: colors.primary[50], borderColor: colors.primary[500] }
                      : { backgroundColor: colors.gray[50], borderColor: colors.gray[200] },
                  ]}
                  onPress={() => setDifficulty(d.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, { color: difficulty === d.value ? colors.primary[500] : colors.gray[600] }]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tags */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Tags</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <MaterialIcons name="close" size={10} color={colors.primary[800]} />
                </TouchableOpacity>
              ))}
              <TextInput
                style={styles.tagInput}
                placeholder="+ Add tag"
                placeholderTextColor={colors.gray[400]}
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={addTag}
                blurOnSubmit={false}
                returnKeyType="done"
              />
            </View>

            {tagSuggestions.flat.length > 0 && (
              <View style={styles.suggestionBlock}>
                {tagSuggestions.groups.map((group) => (
                  <View key={group.id} style={styles.suggestionGroup}>
                    <Text style={styles.suggestionGroupLabel}>{group.title}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.suggestionChipRow}
                      keyboardShouldPersistTaps="handled"
                    >
                      {group.items.map((item) => (
                        <TouchableOpacity
                          key={item.tag}
                          style={styles.suggestionChip}
                          onPress={() => selectTag(item.tag)}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="add" size={14} color={colors.primary[600]} />
                          <Text style={styles.suggestionChipText}>{item.tag}</Text>
                          <Text style={styles.suggestionChipHint}>{item.reason}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>
            )}

            {newTag.trim() && (
              <TouchableOpacity style={styles.customAddRow} onPress={addTag} activeOpacity={0.7}>
                <MaterialIcons name="label" size={16} color={colors.primary[500]} />
                <Text style={styles.customAddText}>
                  Create <Text style={styles.customAddHighlight}>{normalizeTag(newTag)}</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* Reminder */}
          <View style={styles.reminderBlock}>
            <View style={styles.rowField}>
              <View style={styles.rowLabelWrap}>
                <MaterialIcons name="alarm" size={18} color={colors.gray[900]} />
                <Text style={styles.rowLabel}>Remind me</Text>
              </View>
              <Switch
                value={remind}
                onValueChange={(v) => {
                  setRemind(v);
                  if (!v) setShowReminderPicker(false);
                }}
                trackColor={{ false: colors.gray[200], true: colors.primary[400] }}
                thumbColor={remind ? colors.primary[500] : '#FFFFFF'}
              />
            </View>
            {remind && (
              <TouchableOpacity
                style={styles.reminderTimeRow}
                onPress={() => setShowReminderPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.reminderTimeLabel}>Reminder time</Text>
                <Text style={styles.reminderTimeValue}>{formatReminderTime(reminderTime)}</Text>
              </TouchableOpacity>
            )}
            {showReminderPicker && remind && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selected) => {
                  if (Platform.OS !== 'ios') setShowReminderPicker(false);
                  if (selected) setReminderTime(selected);
                }}
              />
            )}
          </View>

          <View style={styles.divider} />

          {/* Subtasks */}
          <View style={styles.field}>
            <View style={styles.subtaskHeader}>
              <Text style={styles.fieldLabel}>Subtasks</Text>
              {subtasks.length > 0 && (
                <Text style={styles.subtaskCount}>
                  {subtasks.filter((s) => s.completed).length}/{subtasks.length} done
                </Text>
              )}
            </View>

            <SegmentedControl
              options={SUBTASK_MODES}
              value={subtaskMode}
              onChange={setSubtaskMode}
              equalWidth
              style={styles.subtaskModeControl}
            />

            {showManualPanel && (
              <View style={styles.manualChecklistBlock}>
                <Text style={styles.manualHint}>
                  Build your own checklist — add steps one at a time.
                </Text>

                {subtasks.length === 0 && (
                  <View style={styles.emptyChecklist}>
                    <MaterialIcons name="checklist-rtl" size={28} color={colors.gray[200]} />
                    <Text style={styles.emptyChecklistText}>No steps yet</Text>
                    <Text style={styles.emptyChecklistSub}>
                      Type below and press return to add each step
                    </Text>
                  </View>
                )}

                {subtasks.map((s) => (
                  <View key={s.id} style={styles.subtaskRow}>
                    <TouchableOpacity
                      style={[styles.subtaskCircle, s.completed && styles.subtaskCircleDone]}
                      onPress={() => toggleSubtask(s.id)}
                    >
                      {s.completed && (
                        <MaterialIcons name="check-circle" size={14} color={colors.primary[500]} />
                      )}
                    </TouchableOpacity>
                    <Text style={[styles.subtaskTitle, s.completed && styles.subtaskTitleDone]}>{s.title}</Text>
                    <TouchableOpacity onPress={() => removeSubtask(s.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <MaterialIcons name="close" size={16} color={colors.gray[400]} />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.manualInputCard}>
                  <MaterialIcons name="add" size={20} color={colors.primary[500]} />
                  <TextInput
                    style={styles.manualSubtaskInput}
                    placeholder="Add a step…"
                    placeholderTextColor={colors.gray[400]}
                    value={newSubtask}
                    onChangeText={setNewSubtask}
                    onSubmitEditing={addSubtask}
                    blurOnSubmit={false}
                    returnKeyType="done"
                  />
                </View>

                {newSubtask.trim() && (
                  <TouchableOpacity style={styles.customAddRow} onPress={addSubtask} activeOpacity={0.7}>
                    <MaterialIcons name="checklist" size={16} color={colors.primary[500]} />
                    <Text style={styles.customAddText}>
                      Add step: <Text style={styles.customAddHighlight}>{newSubtask.trim()}</Text>
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {showSuggestionPanel && (
              <View style={styles.suggestionPanel}>
                {!title.trim() && !hasSubtaskSuggestions && (
                  <View style={styles.suggestionEmpty}>
                    <MaterialIcons name="auto-awesome" size={24} color={colors.gray[200]} />
                    <Text style={styles.suggestionEmptyText}>
                      Write a task title first — we'll suggest relevant checklists and steps.
                    </Text>
                  </View>
                )}

                {subtaskSuggestions.templates.length > 0 && (
                  <View style={styles.suggestionBlock}>
                    <Text style={styles.suggestionGroupLabel}>Matched checklists</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.templateCardRow}
                      keyboardShouldPersistTaps="handled"
                    >
                      {subtaskSuggestions.templates.map((tpl) => (
                        <View key={tpl.id} style={styles.templateCard}>
                          <View style={styles.templateCardHeader}>
                            <View style={styles.templateIconWrap}>
                              <MaterialIcons name={tpl.icon} size={18} color={colors.primary[600]} />
                            </View>
                            <Text style={styles.templateCardTitle} numberOfLines={1}>{tpl.label}</Text>
                          </View>
                          <Text style={styles.templateCardMeta}>
                            {tpl.remainingSteps.length} step{tpl.remainingSteps.length === 1 ? '' : 's'}
                          </Text>
                          <View style={styles.templatePreview}>
                            {tpl.remainingSteps.slice(0, 3).map((step) => (
                              <Text key={step} style={styles.templatePreviewStep} numberOfLines={1}>
                                • {step}
                              </Text>
                            ))}
                            {tpl.remainingSteps.length > 3 && (
                              <Text style={styles.templatePreviewMore}>
                                +{tpl.remainingSteps.length - 3} more
                              </Text>
                            )}
                          </View>
                          <TouchableOpacity
                            style={styles.templateAddBtn}
                            onPress={() => {
                              addSubtaskTemplate(tpl.remainingSteps);
                              setSubtaskMode('manual');
                            }}
                            activeOpacity={0.7}
                          >
                            <MaterialIcons name="playlist-add" size={16} color={colors.primary[500]} />
                            <Text style={styles.templateAddBtnText}>Add all</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {subtaskSuggestions.quickAdds.length > 0 && (
                  <View style={styles.suggestionBlock}>
                    <Text style={styles.suggestionGroupLabel}>Suggested steps</Text>
                    <View style={styles.quickAddWrap}>
                      {subtaskSuggestions.quickAdds.map((item) => (
                        <TouchableOpacity
                          key={item.title}
                          style={styles.quickAddChip}
                          onPress={() => {
                            addSubtaskTitle(item.title);
                            setSubtaskMode('manual');
                          }}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="add-circle-outline" size={14} color={colors.primary[500]} />
                          <Text style={styles.quickAddText}>{item.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {subtasks.length > 0 && (
                  <View style={styles.addedStepsPreview}>
                    <Text style={styles.suggestionGroupLabel}>
                      Added to checklist ({subtasks.length})
                    </Text>
                    {subtasks.map((s) => (
                      <View key={s.id} style={styles.subtaskRowCompact}>
                        <MaterialIcons name="check-circle-outline" size={14} color={colors.primary[400]} />
                        <Text style={styles.subtaskTitleCompact} numberOfLines={1}>{s.title}</Text>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.switchToManualBtn}
                      onPress={() => setSubtaskMode('manual')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.switchToManualText}>Edit checklist</Text>
                      <MaterialIcons name="arrow-forward" size={14} color={colors.primary[500]} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={[styles.field, { marginTop: 8 }]}>
            <PrimaryButton title="Save Task" onPress={handleSave} loading={loading} disabled={!title.trim()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.card },
  kav: { flex: 1 },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[200],
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  cancel: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 22,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 24,
  },
  save: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.primary[500],
    lineHeight: 22,
  },
  saveDisabled: {
    color: colors.gray[400],
  },
  scroll: { paddingBottom: 40 },
  field: { paddingHorizontal: spacing.screenH, paddingVertical: 12 },
  titleField: { paddingVertical: 8 },
  titleInput: {
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 28,
    minHeight: 40,
  },
  descInput: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    lineHeight: 22,
    minHeight: 60,
  },
  divider: { height: 1, backgroundColor: colors.gray[100], marginHorizontal: spacing.screenH },
  rowField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    paddingVertical: 16,
  },
  rowLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.gray[900],
    lineHeight: 22,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.primary[600],
    lineHeight: 22,
  },
  rowValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  datePickerWrap: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: 12,
  },
  reminderBlock: {
    borderBottomWidth: 0,
  },
  reminderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    paddingBottom: 14,
    marginTop: -4,
  },
  reminderTimeLabel: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 18,
  },
  reminderTimeValue: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.primary[500],
    lineHeight: 22,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
    lineHeight: 18,
    marginBottom: 0,
  },
  subtaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subtaskCount: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    lineHeight: 16,
  },
  subtaskModeControl: {
    marginBottom: 14,
  },
  manualChecklistBlock: {
    gap: 4,
  },
  manualHint: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 18,
    marginBottom: 8,
  },
  emptyChecklist: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
    backgroundColor: colors.gray[25],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  emptyChecklistText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.gray[400],
    lineHeight: 20,
  },
  emptyChecklistSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  manualInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.gray[25],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  manualSubtaskInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    lineHeight: 22,
  },
  suggestionPanel: {
    gap: 4,
  },
  suggestionEmpty: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
    backgroundColor: colors.gray[25],
    borderRadius: radius.lg,
    paddingHorizontal: 20,
  },
  suggestionEmptyText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 18,
    textAlign: 'center',
  },
  addedStepsPreview: {
    marginTop: 12,
    gap: 6,
  },
  subtaskRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  subtaskTitleCompact: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[600],
    lineHeight: 18,
  },
  switchToManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  switchToManualText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.primary[500],
    lineHeight: 18,
  },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  priorityPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  diffPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[50],
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 26,
  },
  tagText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.primary[800],
    lineHeight: 16,
  },
  tagInput: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    minWidth: 80,
    height: 26,
    lineHeight: 18,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  subtaskCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCircleDone: {
    borderColor: colors.primary[500],
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    lineHeight: 22,
  },
  subtaskTitleDone: {
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  subtaskAddRow: { paddingTop: 8 },
  subtaskInput: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    lineHeight: 22,
  },
  suggestionBlock: {
    marginTop: 12,
    gap: 10,
  },
  suggestionGroup: {
    gap: 6,
  },
  suggestionGroupLabel: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: colors.gray[400],
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  suggestionChipRow: {
    gap: 8,
    paddingRight: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gray[25],
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 200,
  },
  suggestionChipText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.primary[800],
    lineHeight: 16,
  },
  suggestionChipHint: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 14,
    flexShrink: 1,
  },
  customAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.primary[50],
    borderRadius: radius.md,
  },
  customAddText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[600],
    lineHeight: 18,
    flex: 1,
  },
  customAddHighlight: {
    fontFamily: fonts.semibold,
    color: colors.primary[600],
  },
  templateCardRow: {
    gap: 10,
    paddingRight: 4,
  },
  templateCard: {
    width: 200,
    backgroundColor: colors.gray[25],
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: radius.lg,
    padding: 12,
    gap: 6,
  },
  templateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateCardTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 18,
  },
  templateCardMeta: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    lineHeight: 16,
  },
  templatePreview: {
    gap: 2,
    minHeight: 48,
  },
  templatePreviewStep: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[600],
    lineHeight: 16,
  },
  templatePreviewMore: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.primary[500],
    lineHeight: 14,
    marginTop: 2,
  },
  templateAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  templateAddBtnText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.primary[500],
    lineHeight: 16,
  },
  quickAddWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAddChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  quickAddText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.gray[900],
    lineHeight: 16,
    flexShrink: 1,
  },
});
