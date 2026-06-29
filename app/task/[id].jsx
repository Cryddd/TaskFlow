import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTasks, useToggleTask, useDeleteTask, useToggleSubtask } from '../../lib/hooks/useTasks';
import { colors, fonts, spacing, radius, shadows } from '../../lib/theme';
import { handleTaskToggle, handleTaskDelete } from '../../lib/taskHandlers';
import { useScreenLoading } from '../../lib/useScreenLoading';
import PriorityBadge from '../../components/ui/PriorityBadge';
import ScreenHeader from '../../components/layout/ScreenHeader';
import EmptyState from '../../components/ui/EmptyState';
import { DetailScreenSkeleton } from '../../components/ui/SkeletonLoader';

function formatDate(dateStr, time) {
  if (!dateStr) return 'None';
  const d = new Date(`${dateStr}T00:00:00`);
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (!time) return label;
  const [h, m] = time.split(':');
  const t = new Date();
  t.setHours(Number(h), Number(m));
  return `${label} at ${t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}

function getDueBadge(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const due = new Date(`${dateStr}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, bg: '#FCEAEA', text: '#C13338' };
  if (diff === 0) return { label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), bg: '#F3EADD', text: '#9A7647' };
  return { label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), bg: colors.gray[50], text: colors.gray[400] };
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loading = useScreenLoading();
  const { data: tasks = [], isLoading } = useTasks();
  const toggleTaskMut = useToggleTask();
  const deleteTaskMut = useDeleteTask();
  const toggleSubtaskMut = useToggleSubtask();
  const task = tasks.find((t) => t.id === id);

  if (loading || isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Task" />
        <DetailScreenSkeleton />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Task" />
        <EmptyState
          icon="assignment"
          title="Task not found"
          subtitle="It may have been deleted."
          ctaLabel="Back to Tasks"
          onCta={() => router.back()}
        />
      </View>
    );
  }

  const categoryLabel = task.category ? task.category.charAt(0).toUpperCase() + task.category.slice(1) : 'Task';
  const dueBadge = getDueBadge(task.dueDate);

  const handleDelete = () => {
    Alert.alert('Delete task?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          handleTaskDelete(task.id, () => deleteTaskMut.mutate(task.id));
          router.back();
        },
      },
    ]);
  };

  const handleComplete = () => {
    handleTaskToggle(tasks, task.id, () => toggleTaskMut.mutate(task.id));
    if (!task.completed) router.back();
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={categoryLabel}
        titleStyle={styles.headerCategory}
        rightElement={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/task-new', params: { id: task.id } })} style={styles.headerBtn}>
              <MaterialIcons name="edit" size={22} color={colors.gray[600]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
              <MaterialIcons name="delete" size={22} color={colors.danger[400]} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <Text style={[styles.taskTitle, task.completed && styles.completedTitle]}>{task.title}</Text>

        <View style={styles.metaRow}>
          <PriorityBadge priority={task.priority} />
          <View style={styles.diffBadge}>
            <Text style={styles.diffText}>{task.difficulty}</Text>
          </View>
          {dueBadge && (
            <View style={[styles.dueBadge, { backgroundColor: dueBadge.bg }]}>
              <Text style={[styles.dueText, { color: dueBadge.text }]}>{dueBadge.label}</Text>
            </View>
          )}
        </View>

        {task.description ? (
          <Text style={styles.description}>{task.description}</Text>
        ) : null}

        <View style={styles.divider} />

        {task.subtasks?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})</Text>
            {task.subtasks.map((st) => (
              <TouchableOpacity key={st.id} style={styles.subtaskRow} onPress={() => toggleSubtaskMut.mutate({ taskId: task.id, subtaskId: st.id })}>
                <MaterialIcons
                  name={st.completed ? 'check-circle' : 'radio-button-unchecked'}
                  size={18}
                  color={st.completed ? colors.primary[500] : colors.gray[200]}
                />
                <Text style={[styles.subtaskText, st.completed && styles.subtaskDone]}>{st.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {task.tags?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsRow}>
              {task.tags.map((tag) => (
                <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <Text style={styles.timelineRow}>Created: {formatDate(task.createdAt)}</Text>
          <Text style={styles.timelineRow}>Due: {formatDate(task.dueDate, task.dueTime)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder</Text>
          <Text style={styles.timelineRow}>None</Text>
        </View>

        <TouchableOpacity style={styles.focusBtn} onPress={() => router.push(`/focus/${task.id}`)}>
          <MaterialIcons name="timer" size={20} color={colors.primary[500]} />
          <Text style={styles.focusText}>Start Focus Session</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.completeBtn, task.completed && styles.incompleteBtn]}
          onPress={handleComplete}
        >
          <Text style={[styles.completeBtnText, task.completed && styles.incompleteBtnText]}>
            {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  headerCategory: { fontSize: 13, fontFamily: fonts.semibold, color: colors.primary[800] },
  headerActions: { flexDirection: 'row', gap: 8, width: 64, justifyContent: 'flex-end' },
  headerBtn: { padding: 4 },
  scroll: { paddingHorizontal: spacing.screenH, paddingTop: 20 },
  taskTitle: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 40,
  },
  completedTitle: { color: colors.gray[400], textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  diffBadge: {
    backgroundColor: colors.gray[50],
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  diffText: { fontSize: 11, fontFamily: fonts.medium, color: colors.gray[600], textTransform: 'capitalize' },
  dueBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  dueText: { fontSize: 11, fontFamily: fonts.semibold },
  description: { fontSize: 15, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 22, marginTop: 16 },
  divider: { height: 1, backgroundColor: colors.gray[100], marginVertical: 20 },
  section: { marginBottom: 20, gap: 8 },
  sectionTitle: { fontSize: 13, fontFamily: fonts.semibold, color: colors.gray[600] },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  subtaskText: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[900] },
  subtaskDone: { color: colors.gray[400], textDecorationLine: 'line-through' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: colors.primary[50], borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, fontFamily: fonts.medium, color: colors.primary[800] },
  timelineRow: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray[600] },
  focusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary[500],
    marginTop: 8,
  },
  focusText: { fontSize: 15, fontFamily: fonts.semibold, color: colors.primary[500] },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.screenH,
    paddingTop: 12,
    backgroundColor: colors.bg.app,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  completeBtn: {
    height: 52,
    backgroundColor: colors.primary[500],
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: { fontSize: 15, fontFamily: fonts.bold, color: colors.gray[0] },
  incompleteBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary[500] },
  incompleteBtnText: { color: colors.primary[500] },
});
