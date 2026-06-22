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
import { colors, fonts, spacing, radius } from '../../lib/theme';
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
  { id: 'today',    label: 'Today'         },
  { id: 'high',     label: 'High Priority' },
  { id: 'pending',  label: 'Incomplete'    },
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
      { text: 'Due Date', onPress: () => setSortBy('date') },
      { text: 'Title', onPress: () => setSortBy('title') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleSort}>
            <MaterialIcons name="swap-vert" size={22} color={colors.gray[900]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
            <MaterialIcons name="tune" size={22} color={colors.gray[900]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Category segmented control */}
        <View style={styles.padH}>
          <SegmentedControl options={CATEGORIES} value={category} onChange={setCategory} />
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
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>{chip.label}</Text>
                {active && <MaterialIcons name="close" size={14} color={colors.primary[500]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sort label */}
        <View style={styles.padH}>
          <TouchableOpacity onPress={handleSort} style={styles.sortRow}>
            <Text style={styles.sortText}>
              Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task list */}
        <View style={[styles.padH, styles.taskList]}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="assignment" size={48} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>No tasks found.</Text>
              <Text style={styles.emptySubtitle}>Try adjusting filters or add a new task.</Text>
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

        {/* Quick Add */}
        <View style={[styles.padH, styles.quickAddRow]}>
          <TextInput
            style={styles.quickAddInput}
            placeholder="+ Add task…"
            placeholderTextColor={colors.gray[400]}
            value={quickAddText}
            onChangeText={setQuickAddText}
            onSubmitEditing={handleQuickAdd}
            returnKeyType="done"
          />
          {quickAddText.length > 0 && (
            <TouchableOpacity style={styles.quickAddBtn} onPress={handleQuickAdd}>
              <MaterialIcons name="add" size={18} color={colors.gray[0]} />
            </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.gray[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  scroll: { paddingBottom: 100 },
  padH: { paddingHorizontal: spacing.screenH },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenH,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  activeChip: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 18,
  },
  activeChipText: {
    color: colors.primary[500],
  },
  sortRow: { paddingVertical: 4 },
  sortText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    lineHeight: 17,
  },
  taskList: { gap: 8, marginTop: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 17, fontFamily: fonts.semibold, color: colors.gray[600], lineHeight: 24 },
  emptySubtitle: { fontSize: 15, fontFamily: fonts.regular, color: colors.gray[400], lineHeight: 22, textAlign: 'center' },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  quickAddInput: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    backgroundColor: colors.bg.card,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[900],
  },
  quickAddBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
