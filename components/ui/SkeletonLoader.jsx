import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, radius } from '../../lib/theme';

function SkeletonBlock({ width, height, style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.block,
        { width, height: height ?? 14, opacity, borderRadius: typeof width === 'string' ? radius.sm : Math.min(radius.sm, (height ?? 14) / 2) },
        style,
      ]}
    />
  );
}

export function TaskItemSkeleton() {
  return (
    <View style={styles.taskRow}>
      <SkeletonBlock width={22} height={22} style={{ borderRadius: 11 }} />
      <View style={styles.taskContent}>
        <SkeletonBlock width="70%" height={14} />
        <SkeletonBlock width="40%" height={11} />
      </View>
    </View>
  );
}

export function HabitRingSkeleton() {
  return (
    <View style={styles.habitWrapper}>
      <SkeletonBlock width={72} height={72} style={{ borderRadius: 36 }} />
      <SkeletonBlock width={56} height={10} />
    </View>
  );
}

export function CommandCenterSkeleton() {
  return (
    <View style={styles.commandCenter}>
      <SkeletonBlock width={128} height={128} style={{ borderRadius: 64 }} />
      <View style={styles.ccRight}>
        <SkeletonBlock width="80%" height={12} />
        <SkeletonBlock width="60%" height={12} />
        <SkeletonBlock width="50%" height={12} />
      </View>
    </View>
  );
}

export function DetailScreenSkeleton() {
  return (
    <View style={styles.detail}>
      <SkeletonBlock width={72} height={24} style={{ borderRadius: radius.pill }} />
      <SkeletonBlock width="90%" height={32} style={{ marginTop: 16 }} />
      <View style={styles.pillRow}>
        <SkeletonBlock width={64} height={22} style={{ borderRadius: radius.pill }} />
        <SkeletonBlock width={56} height={22} style={{ borderRadius: radius.pill }} />
        <SkeletonBlock width={48} height={22} style={{ borderRadius: radius.pill }} />
      </View>
      <SkeletonBlock width="100%" height={14} style={{ marginTop: 16 }} />
      <SkeletonBlock width="75%" height={14} />
      <View style={styles.divider} />
      <SkeletonBlock width={80} height={12} />
      <SkeletonBlock width="100%" height={40} style={{ marginTop: 8 }} />
      <SkeletonBlock width="100%" height={40} />
      <SkeletonBlock width={80} height={12} style={{ marginTop: 16 }} />
      <SkeletonBlock width="60%" height={14} style={{ marginTop: 8 }} />
      <SkeletonBlock width="70%" height={14} />
    </View>
  );
}

export function HabitDetailSkeleton() {
  return (
    <View style={styles.detail}>
      <View style={styles.centered}>
        <SkeletonBlock width={120} height={120} style={{ borderRadius: 60 }} />
        <SkeletonBlock width={100} height={12} style={{ marginTop: 8 }} />
      </View>
      <SkeletonBlock width="100%" height={72} style={{ borderRadius: radius.md, marginTop: 16 }} />
      <SkeletonBlock width={100} height={12} style={{ marginTop: 20 }} />
      <View style={styles.chainPlaceholder}>
        {Array.from({ length: 42 }).map((_, i) => (
          <SkeletonBlock key={i} width={10} height={10} style={{ borderRadius: 2 }} />
        ))}
      </View>
      <SkeletonBlock width={80} height={12} style={{ marginTop: 16 }} />
      <View style={styles.weekSkeleton}>
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBlock key={i} width={32} height={32} style={{ borderRadius: 16 }} />
        ))}
      </View>
    </View>
  );
}

export function NoteEditorSkeleton() {
  return (
    <View style={styles.detail}>
      <SkeletonBlock width="70%" height={28} />
      <SkeletonBlock width={160} height={11} style={{ marginTop: 8 }} />
      <View style={styles.divider} />
      <SkeletonBlock width="100%" height={14} />
      <SkeletonBlock width="95%" height={14} style={{ marginTop: 8 }} />
      <SkeletonBlock width="88%" height={14} style={{ marginTop: 8 }} />
      <SkeletonBlock width="92%" height={14} style={{ marginTop: 8 }} />
      <SkeletonBlock width="60%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <TaskItemSkeleton key={i} />
      ))}
    </View>
  );
}

export function HabitListSkeleton({ count = 4 }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.habitListRow}>
          <SkeletonBlock width={44} height={44} style={{ borderRadius: 22 }} />
          <View style={styles.taskContent}>
            <SkeletonBlock width="50%" height={14} />
            <SkeletonBlock width="35%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function NotesGridSkeleton({ count = 4 }) {
  return (
    <View style={styles.notesGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.noteCard}>
          <SkeletonBlock width="80%" height={13} />
          <SkeletonBlock width="100%" height={11} style={{ marginTop: 6 }} />
          <SkeletonBlock width="90%" height={11} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
}

export function FormSkeleton() {
  return (
    <View style={styles.detail}>
      <View style={styles.centered}>
        <SkeletonBlock width={88} height={88} style={{ borderRadius: 44 }} />
        <SkeletonBlock width={80} height={12} style={{ marginTop: 8 }} />
      </View>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={{ marginTop: 20, gap: 8 }}>
          <SkeletonBlock width={80} height={12} />
          <SkeletonBlock width="100%" height={48} style={{ borderRadius: radius.sm }} />
        </View>
      ))}
    </View>
  );
}

export function SettingsListSkeleton({ count = 5 }) {
  return (
    <View style={[styles.settingsCard, { borderRadius: radius.lg }]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.settingsRow}>
          <SkeletonBlock width={36} height={36} style={{ borderRadius: 18 }} />
          <View style={styles.taskContent}>
            <SkeletonBlock width="55%" height={14} />
            <SkeletonBlock width="40%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function CategoryDetailSkeleton() {
  return (
    <View>
      <SkeletonBlock width="100%" height={160} style={{ borderRadius: 0 }} />
      <View style={[styles.detail, { marginTop: 20 }]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.categoryRow}>
            <SkeletonBlock width={40} height={40} style={{ borderRadius: 20 }} />
            <View style={styles.taskContent}>
              <SkeletonBlock width="60%" height={14} />
              <SkeletonBlock width="80%" height={11} />
            </View>
            <SkeletonBlock width={52} height={32} style={{ borderRadius: radius.pill }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.gray[100],
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    minHeight: 72,
  },
  taskContent: { flex: 1, gap: 8 },
  habitWrapper: { alignItems: 'center', width: 80, gap: 6 },
  commandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    minHeight: 128,
  },
  ccRight: { flex: 1, gap: 10 },
  detail: { padding: 20, gap: 4 },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  divider: { height: 1, backgroundColor: colors.gray[100], marginVertical: 20 },
  centered: { alignItems: 'center' },
  chainPlaceholder: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginTop: 8 },
  weekSkeleton: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  list: { gap: 8 },
  habitListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  notesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  noteCard: {
    width: '47%',
    padding: 12,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    minHeight: 80,
  },
  settingsCard: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.gray[100],
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: 10,
  },
});
