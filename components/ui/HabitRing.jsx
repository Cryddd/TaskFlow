import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts, radius } from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 72;
const STROKE = 4;
const R = (SIZE - STROKE * 2) / 2;
const CIRC = 2 * Math.PI * R;
const CX = SIZE / 2;
const CY = SIZE / 2;

export default function HabitRing({ habit, onPress }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const completedDays = habit.weekProgress?.filter(Boolean).length ?? 0;
  const totalDays = habit.weekProgress?.length ?? 7;
  const progress = totalDays > 0 ? completedDays / totalDays : 0;
  const pct = Math.round(progress * 100);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 600,
      delay: 0,
      useNativeDriver: false,
      easing: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1
          : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      },
    }).start();
  }, [progress]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRC, 0],
  });

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.0, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.wrapper}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.ringContainer}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={colors.gray[100]}
              strokeWidth={STROKE}
            />
            <AnimatedCircle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={habit.completedToday ? colors.success[400] : colors.primary[500]}
              strokeWidth={STROKE}
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90, ${CX}, ${CY})`}
            />
          </Svg>
          <View style={styles.centerOverlay} pointerEvents="none">
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>
        </View>
      </Animated.View>
      <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
      <View style={styles.streakRow}>
        <View style={[styles.streakDot, { backgroundColor: colors.success[400] }]} />
        <Text style={styles.streakText}>{habit.streak}d streak</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  ringContainer: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  name: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 17,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  streakText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
  },
});
