import { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radius, priority as priorityColors, shadows } from '../../lib/theme';

const DUE_DATE_FORMAT = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  const due = new Date(dateStr);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, type: 'overdue' };
  if (diff === 0) return { label: 'Today', type: 'today' };
  if (diff === 1) return { label: 'Tomorrow', type: 'future' };
  return { label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), type: 'future' };
};

const DUE_BADGE_STYLES = {
  overdue: { bg: '#FEF2F2', text: '#EF4444' },
  today:   { bg: '#FFFBEB', text: '#F59E0B' },
  future:  { bg: colors.gray[50], text: colors.gray[400] },
};

export default function TaskItem({ task, onToggle, onDelete, onPress }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(1)).current;
  const strikeWidth = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const titleOpacity = useRef(new Animated.Value(task.completed ? 0.45 : 1)).current;
  const rowScale = useRef(new Animated.Value(1)).current;

  const SWIPE_THRESHOLD = 60;
  const MAX_LEFT = -220;
  const MAX_RIGHT = 80;

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      const dx = Math.max(MAX_LEFT, Math.min(MAX_RIGHT, e.translationX));
      translateX.setValue(dx);
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        Animated.spring(translateX, {
          toValue: MAX_LEFT,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } else if (e.translationX > SWIPE_THRESHOLD) {
        Animated.spring(translateX, {
          toValue: MAX_RIGHT,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    });

  const closeSwipe = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 100, friction: 8 }).start();
  };

  const handleToggle = () => {
    const completing = !task.completed;
    closeSwipe();

    Animated.sequence([
      Animated.timing(checkScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(checkScale, { toValue: 1.0, duration: 100, useNativeDriver: true }),
    ]).start();

    Animated.timing(strikeWidth, {
      toValue: completing ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();

    Animated.timing(titleOpacity, {
      toValue: completing ? 0.45 : 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.timing(rowScale, { toValue: 0.99, duration: 100, useNativeDriver: true }),
      Animated.spring(rowScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 6 }),
    ]).start();

    onToggle?.(task.id);
  };

  const due = DUE_DATE_FORMAT(task.dueDate);
  const dueBadge = due ? DUE_BADGE_STYLES[due.type] : null;

  return (
    <Animated.View style={[styles.rowWrapper, { transform: [{ scale: rowScale }] }]}>
      {/* Left swipe actions (shown when swiping left = negative translateX) */}
      <View style={styles.leftActions}>
        <TouchableOpacity style={[styles.action, styles.actionDetails]} onPress={() => { closeSwipe(); onPress?.(task); }}>
          <MaterialIcons name="info-outline" size={20} color={colors.gray[0]} />
          <Text style={styles.actionLabel}>Details</Text>
        </TouchableOpacity>
      </View>

      {/* Right swipe actions */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={[styles.action, styles.actionComplete]} onPress={() => { handleToggle(); }}>
          <MaterialIcons name="check-circle-outline" size={20} color={colors.gray[0]} />
          <Text style={styles.actionLabel}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.action, styles.actionSchedule]} onPress={closeSwipe}>
          <MaterialIcons name="event-available" size={20} color={colors.gray[0]} />
          <Text style={styles.actionLabel}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.action, styles.actionDelete]} onPress={() => { closeSwipe(); onDelete?.(task.id); }}>
          <MaterialIcons name="delete-sweep" size={20} color={colors.gray[0]} />
          <Text style={styles.actionLabel}>Delete</Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
          {/* Completion circle */}
          <TouchableOpacity onPress={handleToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {task.completed ? (
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <MaterialIcons name="check-circle" size={22} color={colors.primary[500]} />
              </Animated.View>
            ) : (
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <MaterialIcons name="radio-button-unchecked" size={22} color={colors.gray[200]} />
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Content — tap body opens detail */}
          <TouchableOpacity
            style={styles.content}
            onPress={() => onPress?.(task)}
            activeOpacity={0.7}
          >
            <View style={styles.titleRow}>
              {/* Priority dot */}
              <View style={[styles.priorityDot, { backgroundColor: priorityColors[task.priority] ?? priorityColors.none }]} />
              <Animated.Text
                style={[
                  styles.title,
                  task.completed && styles.titleCompleted,
                  { opacity: titleOpacity },
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Animated.Text>
              {task.dueTime && !task.completed && (
                <Text style={styles.time}>{task.dueTime}</Text>
              )}
            </View>

            <View style={styles.metaRow}>
              {task.tags?.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {due && !task.completed && (
                <View style={[styles.dueBadge, { backgroundColor: dueBadge.bg }]}>
                  <Text style={[styles.dueText, { color: dueBadge.text }]}>{due.label}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rowWrapper: {
    position: 'relative',
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  leftActions: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    width: 72,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  actionDetails: { backgroundColor: colors.primary[500] },
  actionComplete: { backgroundColor: colors.success[400] },
  actionSchedule: { backgroundColor: colors.warning[400] },
  actionDelete: { backgroundColor: colors.danger[400] },
  actionLabel: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: '#FFFFFF',
    lineHeight: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.bg.card,
    minHeight: 72,
  },
  content: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 22,
  },
  titleCompleted: {
    fontFamily: fonts.regular,
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  time: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    paddingLeft: 14,
  },
  tag: {
    backgroundColor: colors.primary[50],
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    height: 20,
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.primary[800],
    lineHeight: 14,
  },
  dueBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    height: 20,
    justifyContent: 'center',
  },
  dueText: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    lineHeight: 14,
  },
});
