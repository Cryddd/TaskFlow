import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTasks, useCreateTask, useToggleTask, useDeleteTask } from '../../lib/hooks/useTasks';
import { colors, brand, fonts, spacing, radius, shadows } from '../../lib/theme';
import { handleTaskToggle, handleTaskDelete } from '../../lib/taskHandlers';
import { showToast } from '../../lib/toast';
import TaskItem from '../../components/ui/TaskItem';
import SegmentedControl from '../../components/ui/SegmentedControl';

const CATEGORIES = [
  { label: 'All',      value: 'all'      },
  { label: 'Work',     value: 'work'     },
  { label: 'Personal', value: 'personal' },
  { label: 'Goals',    value: 'goals'    },
];

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };

const FILTER_CHIPS = [
  { id: 'today',    label: 'Today'      },
  { id: 'high',     label: 'High'       },
  { id: 'pending',  label: 'Incomplete' },
];

export default function TasksScreen() {
  const router = useRouter();
  const { data: tasks = [] } = useTasks();
  const createTaskMut = useCreateTask();
  const toggleTaskMut = useToggleTask();
  const deleteTaskMut = useDeleteTask();
  const [category, setCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('priority');
  const [quickAddText, setQuickAddText] = useState('');

  const fmt = (d) => d.toISOString().split('T')[0];
  const today = fmt(new Date());

  const openCount = tasks.filter((t) => !t.completed).length;
  const doneToday = tasks.filter((t) => t.completed && t.dueDate === today).length;

  const toggleFilter = (id) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  let filtered = tasks;
  if (category !== 'all') filtered = filtered.filter((t) => t.category === category);
  if (activeFilters.includes('today')) filtered = filtered.filter((t) => t.dueDate === today);
  if (activeFilters.includes('high')) filtered = filtered.filter((t) => ['urgent', 'high'].includes(t.priority));
  if (activeFilters.includes('pending')) filtered = filtered.filter((t) => !t.completed);

  if (sortBy === 'priority') {
    filtered = [...filtered].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4));
  } else if (sortBy === 'date') {
    filtered = [...filtered].sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
  } else if (sortBy === 'title') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }

  const onToggleTask = (id) => handleTaskToggle(tasks, id, () => toggleTaskMut.mutate(id));
  const onDeleteTask = (id) => handleTaskDelete(id, () => deleteTaskMut.mutate(id));

  const handleQuickAdd = () => {
    if (!quickAddText.trim()) return;
    createTaskMut.mutate({
      title: quickAddText.trim(),
      priority: 'medium',
      difficulty: 'regular',
      category: category === 'all' ? 'work' : category,
      tags: [],
      dueDate: today,
      dueTime: null,
    });
    setQuickAddText('');
    showToast.taskCreated();
  };

  const handleSort = () => {
    Alert.alert('Sort by', '', [
      { text: 'Priority', onPress: () => setSortBy('priority') },
      { text: 'Due date', onPress: () => setSortBy('date') },
      { text: 'Title', onPress: () => setSortBy('title') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const sortLabel = sortBy.charAt(0).toUpperCase() + sortBy.slice(1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>{openCount} open · {doneToday} done today</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={handleSort} hitSlop={8}>
          <MaterialIcons name="swap-vert" size={20} color={brand.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Category segmented control */}
        <View style={styles.padH}>
          <SegmentedControl options={CATEGORIES} value={category} onChange={setCategory} equalWidth />
        </View>

        {/* Quick capture */}
        <View style={[styles.padH, styles.captureWrap]}>
          <View style={styles.capture}>
            <MaterialIcons name="add" size={22} color={brand.ink} />
            <TextInput
              style={styles.captureInput}
              placeholder="Add a task…"
              placeholderTextColor={colors.gray[400]}
              value={quickAddText}
              onChangeText={setQuickAddText}
              onSubmitEditing={handleQuickAdd}
              returnKeyType="done"
            />
            {quickAddText.length > 0 && (
              <TouchableOpacity style={styles.captureBtn} onPress={handleQuickAdd}>
                <MaterialIcons name="arrow-upward" size={20} color={brand.canvas} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTER_CHIPS.map((chip) => {
            const active = activeFilters.includes(chip.id);
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => toggleFilter(chip.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>{chip.label}</Text>
                {active && <MaterialIcons name="close" size={14} color={brand.canvas} />}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.sortChip} onPress={handleSort} activeOpacity={0.8}>
            <MaterialIcons name="sort" size={14} color={colors.gray[600]} />
            <Text style={styles.sortChipText}>{sortLabel}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Task list */}
        <View style={[styles.padH, styles.taskList]}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="task-alt" size={44} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>No tasks here</Text>
              <Text style={styles.emptySubtitle}>Add one above or adjust your filters.</Text>
            </View>
          ) : (
            filtered.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onPress={(task) => router.push(`/task/${task.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.app },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: brand.ink,
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    marginTop: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  scroll: { paddingBottom: 150 },
  padH: { paddingHorizontal: spacing.screenH },
  captureWrap: { marginTop: 16 },
  capture: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    minHeight: 54,
    ...shadows.card,
  },
  captureInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: brand.ink,
  },
  captureBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenH,
    paddingVertical: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.subtle,
  },
  activeChip: {
    backgroundColor: brand.ink,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 18,
  },
  activeChipText: {
    color: brand.canvas,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sortChipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 18,
  },
  taskList: { gap: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 17, fontFamily: fonts.semibold, color: colors.gray[600], lineHeight: 24 },
  emptySubtitle: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[400], lineHeight: 20, textAlign: 'center' },
});
