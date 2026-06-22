import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts, radius, shadows, spacing } from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RINGS = [
  { key: 'tasks',  r: 52, stroke: 8, color: colors.primary[500],  delay: 0   },
  { key: 'habits', r: 38, stroke: 7, color: colors.success[400],   delay: 100 },
  { key: 'goals',  r: 25, stroke: 6, color: colors.warning[400],   delay: 200 },
];

function Ring({ r, stroke, color, progress, delay }) {
  const circ = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(1, Math.max(0, progress)),
      duration: 700,
      delay,
      useNativeDriver: false,
      easing: (t) => {
        // cubic-bezier(0.34, 1.56, 0.64, 1) — slight overshoot
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      },
    }).start();
  }, [progress]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circ, 0],
  });

  const cx = 64;
  const cy = 64;

  return (
    <>
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={colors.gray[100]}
        strokeWidth={stroke}
      />
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90, ${cx}, ${cy})`}
      />
    </>
  );
}

function getMotivationalLabel(pct) {
  if (pct === 100) return 'Perfect day! All tasks complete 🏆';
  if (pct >= 76)  return 'Almost done! Finish strong 🎯';
  if (pct >= 51)  return "Over halfway there! You're crushing it";
  if (pct >= 26)  return 'Great momentum! Keep going →';
  return "Let's get started 💪";
}

export default function DailyCommandCenter({ stats }) {
  const { tasks, habits, goals, overallPct } = stats;
  const taskPct  = tasks.total  > 0 ? tasks.completed  / tasks.total  : 0;
  const habitPct = habits.total > 0 ? habits.completed / habits.total : 0;
  const goalPct  = goals.active > 0 ? 0.65 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.inner}>
        {/* Rings */}
        <View style={styles.ringsWrapper}>
          <Svg width={128} height={128}>
            {RINGS.map(({ key, r, stroke, color, delay }) => (
              <Ring
                key={key}
                r={r}
                stroke={stroke}
                color={color}
                progress={key === 'tasks' ? taskPct : key === 'habits' ? habitPct : goalPct}
                delay={delay}
              />
            ))}
          </Svg>
          <View style={styles.centerOverlay} pointerEvents="none">
            <Text style={styles.centerPct}>{overallPct}%</Text>
            <Text style={styles.centerLabel}>Today</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <StatRow
            dot={colors.primary[500]}
            label="Tasks"
            value={`${tasks.completed}/${tasks.total} completed`}
          />
          <StatRow
            dot={colors.success[400]}
            label="Habits"
            value={`${habits.completed}/${habits.total} on track`}
          />
          <StatRow
            dot={colors.warning[400]}
            label="Goals"
            value={`${goals.active} active`}
          />
        </View>
      </View>

      {/* Bottom bar */}
      <View style={styles.footer}>
        <View style={styles.footerBar}>
          <View style={[styles.footerFill, { width: `${overallPct}%` }]} />
        </View>
        <Text style={styles.footerLabel}>{getMotivationalLabel(overallPct)}</Text>
      </View>
    </View>
  );
}

function StatRow({ dot, label, value }) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <View style={styles.statTexts}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.cardP,
    gap: 16,
  },
  ringsWrapper: {
    width: 128,
    height: 128,
    position: 'relative',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPct: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 32,
  },
  centerLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
  },
  stats: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statTexts: {
    gap: 1,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[600],
    lineHeight: 18,
  },
  statValue: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.cardP,
    paddingBottom: spacing.cardP,
    gap: 6,
  },
  footerBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  footerFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
  footerLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
  },
});
