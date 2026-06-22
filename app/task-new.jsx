import { useState, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useStore } from '../lib/store';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { showToast } from '../lib/toast';
import PrimaryButton from '../components/ui/PrimaryButton';
import SegmentedControl from '../components/ui/SegmentedControl';

const CATEGORIES = [
  { label: 'Work',     value: 'work'     },
  { label: 'Personal', value: 'personal' },
  { label: 'Goals',    value: 'goals'    },
];

const PRIORITIES = [
  { label: 'Urgent', value: 'urgent', bg: '#FEF2F2', active: '#EF4444' },
  { label: 'High',   value: 'high',   bg: '#FFFBEB', active: '#D97706' },
  { label: 'Medium', value: 'medium', bg: '#EEEDFE', active: '#534AB7' },
  { label: 'Low',    value: 'low',    bg: '#F0FDF4', active: '#16A34A' },
];

const DIFFICULTIES = [
  { label: 'Hard',    value: 'hard'    },
  { label: 'Regular', value: 'regular' },
  { label: 'Easy',    value: 'easy'    },
];

const fmt = (d) => d.toISOString().split('T')[0];

export default function TaskNewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tasks, addTask, updateTask } = useStore();

  const existing = id ? tasks.find((t) => t.id === id) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState(existing?.category ?? 'work');
  const [priority, setPriority] = useState(existing?.priority ?? 'medium');
  const [difficulty, setDifficulty] = useState(existing?.difficulty ?? 'regular');
  const [tags, setTags] = useState(existing?.tags ?? []);
  const [newTag, setNewTag] = useState('');
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? fmt(new Date()));
  const [remind, setRemind] = useState(false);
  const [subtasks, setSubtasks] = useState(existing?.subtasks ?? []);
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(false);

  const titleRef = useRef(null);

  const handleSave = () => {
    if (!title.trim()) return;
    setLoading(true);
    setTimeout(() => {
      if (existing) {
        updateTask(existing.id, { title: title.trim(), description, category, priority, difficulty, tags, dueDate, subtasks });
        showToast.taskUpdated();
      } else {
        addTask({ title: title.trim(), description, category, priority, difficulty, tags, dueDate, dueTime: null, subtasks });
        showToast.taskCreated();
      }
      setLoading(false);
      router.back();
    }, 200);
  };

  const addTag = () => {
    const t = newTag.trim().startsWith('#') ? newTag.trim() : `#${newTag.trim()}`;
    if (newTag.trim() && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setNewTag('');
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: `st${Date.now()}`, title: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (stId) => {
    setSubtasks(subtasks.map((s) => s.id === stId ? { ...s, completed: !s.completed } : s));
  };

  const removeSubtask = (stId) => setSubtasks(subtasks.filter((s) => s.id !== stId));

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
            <SegmentedControl options={CATEGORIES} value={category} onChange={setCategory} />
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
          <View style={styles.rowField}>
            <View style={styles.rowLabelWrap}>
              <MaterialIcons name="event" size={18} color={colors.gray[900]} />
              <Text style={styles.rowLabel}>Due Date</Text>
            </View>
            <Text style={styles.rowValue}>{dueDate}</Text>
          </View>

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
                      ? { backgroundColor: p.bg, borderColor: p.active }
                      : { backgroundColor: colors.gray[50], borderColor: colors.gray[200] },
                  ]}
                  onPress={() => setPriority(p.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, { color: priority === p.value ? p.active : colors.gray[600] }]}>
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
          </View>

          <View style={styles.divider} />

          {/* Reminder */}
          <View style={styles.rowField}>
            <View style={styles.rowLabelWrap}>
              <MaterialIcons name="alarm" size={18} color={colors.gray[900]} />
              <Text style={styles.rowLabel}>Remind me</Text>
            </View>
            <Switch
              value={remind}
              onValueChange={setRemind}
              trackColor={{ false: colors.gray[200], true: colors.primary[400] }}
              thumbColor={remind ? colors.primary[500] : '#FFFFFF'}
            />
          </View>

          <View style={styles.divider} />

          {/* Subtasks */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Subtasks</Text>
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
                  <MaterialIcons name="delete" size={14} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.subtaskAddRow}>
              <TextInput
                style={styles.subtaskInput}
                placeholder="+ Add subtask"
                placeholderTextColor={colors.gray[400]}
                value={newSubtask}
                onChangeText={setNewSubtask}
                onSubmitEditing={addSubtask}
                blurOnSubmit={false}
                returnKeyType="done"
              />
            </View>
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
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 22,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
    lineHeight: 18,
    marginBottom: 8,
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
});
