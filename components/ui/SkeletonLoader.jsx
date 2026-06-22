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
});
