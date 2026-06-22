import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTasks, useToggleTask, useDeleteTask } from '../lib/hooks/useTasks';
import { colors, spacing } from '../lib/theme';
import { handleTaskToggle, handleTaskDelete } from '../lib/taskHandlers';
import { useScreenLoading } from '../lib/useScreenLoading';
import ScreenHeader from '../components/layout/ScreenHeader';
import TaskItem from '../components/ui/TaskItem';
import SegmentedControl from '../components/ui/SegmentedControl';
import EmptyState from '../components/ui/EmptyState';
import { ListSkeleton } from '../components/ui/SkeletonLoader';

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Goals', value: 'goals' },
];

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };

export default function SeeAllTasksScreen() {
  const router = useRouter();
  const loading = useScreenLoading();
  const { data: tasks = [], isLoading } = useTasks();
  const toggleTaskMut = useToggleTask();
  const deleteTaskMut = useDeleteTask();
  const [category, setCategory] = useState('all');

  let filtered = tasks;
  if (category !== 'all') filtered = filtered.filter((t) => t.category === category);
  filtered = [...filtered].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)
  );

  const onToggleTask = (id) => handleTaskToggle(tasks, id, () => toggleTaskMut.mutate(id));
  const onDeleteTask = (id) => handleTaskDelete(id, () => deleteTaskMut.mutate(id));

  return (
    <View style={styles.screen}>
      <ScreenHeader title="All Tasks" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SegmentedControl options={CATEGORIES} value={category} onChange={setCategory} />
        {loading || isLoading ? (
          <ListSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="check-box-outline-blank"
            title="No tasks yet. Add your first one."
            ctaLabel="Add Task"
            onCta={() => router.push('/task-new')}
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onPress={(t) => router.push(`/task/${t.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  scroll: { padding: spacing.screenH, paddingBottom: 40, gap: 16 },
  list: { gap: 8, marginTop: 8 },
});
