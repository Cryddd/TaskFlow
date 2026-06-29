import { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, brand, fonts, radius, shadows } from '../../lib/theme';

const DOTS = 7;

// A plain-language habit card: icon · name · this-week dots · streak · done.
export default function HabitCard({ habit, onPress, onToggle }) {
  const scale = useRef(new Animated.Value(1)).current;
  const done = !!habit.completedToday;

  const week = Array.isArray(habit.weekProgress) ? habit.weekProgress.slice(-DOTS) : [];
  const dots = Array.from({ length: DOTS }, (_, i) => week[i] ?? false);
  const streak = habit.streak ?? 0;

  const handleToggle = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.18, useNativeDriver: true, speed: 50, bounciness: 14 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 10 }),
    ]).start();
    onToggle?.(habit.id);
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => onPress?.(habit.id)}>
      <View style={styles.iconChip}>
        <Text style={styles.icon}>{habit.icon || '✨'}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.dots}>
            {dots.map((d, i) => (
              <View key={i} style={[styles.dot, d && styles.dotFilled]} />
            ))}
          </View>
          <Text style={styles.streak}>
            {streak > 0 ? `${streak} day streak` : 'Start today'}
          </Text>
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.8}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={done ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`}
          style={[styles.check, done ? styles.checkDone : styles.checkOpen]}
        >
          <MaterialIcons name="check" size={20} color={done ? '#FFFFFF' : colors.gray[200]} />
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.card,
  },
  iconChip: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.accent.powder50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 21,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: brand.ink,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 7,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.gray[100],
  },
  dotFilled: {
    backgroundColor: brand.sand,
  },
  streak: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
  },
  check: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.success[400],
  },
  checkOpen: {
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
});
