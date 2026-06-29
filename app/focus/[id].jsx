import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTasks } from '../../lib/hooks/useTasks';
import { useLogFocusSession } from '../../lib/hooks/useMisc';
import LivingGradient from '../../components/ui/LivingGradient';
import { colors, brand, fonts } from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const POMODORO_MINS = 25;
const BREAK_MINS = 5;

const SIZE = 240;
const STROKE = 8;
const R = (SIZE - STROKE * 2) / 2;
const CIRC = 2 * Math.PI * R;

export default function FocusModeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: tasks = [] } = useTasks();
  const logFocusMut = useLogFocusSession();
  const sessionStartRef = useRef(Date.now());
  const workSecondsRef = useRef(0);

  const task = tasks.find((t) => t.id === id);

  const [totalSecs, setTotalSecs] = useState(POMODORO_MINS * 60);
  const [remaining, setRemaining] = useState(POMODORO_MINS * 60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('work');
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            if (phase === 'work') {
              workSecondsRef.current += totalSecs;
              setPhase('break');
              setTotalSecs(BREAK_MINS * 60);
              setRemaining(BREAK_MINS * 60);
            } else {
              setPhase('work');
              setTotalSecs(POMODORO_MINS * 60);
              setRemaining(POMODORO_MINS * 60);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, phase]);

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');
  const progress = 1 - remaining / totalSecs;
  const ringColor = phase === 'work' ? brand.powder : colors.success[400];

  // Smoothly sweep the ring between ticks.
  const ringAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(ringAnim, {
      toValue: Math.min(1, Math.max(0, progress)),
      duration: running ? 980 : 300,
      useNativeDriver: false,
    }).start();
  }, [progress, running]);
  const ringOffset = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [CIRC, 0] });

  // Breathing halo behind the play button while running.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (running) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(0);
  }, [running]);
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const endSession = () => {
    if (workSecondsRef.current > 0 && id) {
      logFocusMut.mutate({
        taskId: id,
        durationSeconds: workSecondsRef.current,
        sessionType: 'work',
        startedAt: new Date(sessionStartRef.current).toISOString(),
        endedAt: new Date().toISOString(),
      });
    }
    router.back();
  };

  const skipBreak = () => {
    clearInterval(timerRef.current);
    setPhase('work');
    setTotalSecs(POMODORO_MINS * 60);
    setRemaining(POMODORO_MINS * 60);
    setRunning(false);
  };

  return (
    <LivingGradient style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={endSession} hitSlop={8} style={styles.closeBtn}>
            <MaterialIcons name="close" size={22} color="rgba(254,250,239,0.7)" />
          </TouchableOpacity>
          <View style={styles.phasePill}>
            <View style={[styles.phaseDot, { backgroundColor: ringColor }]} />
            <Text style={styles.phaseLabel}>{phase === 'work' ? 'Focus session' : 'Short break'}</Text>
          </View>
          <View style={styles.closeBtn} />
        </View>

        <View style={styles.center}>
          <Text style={styles.taskName} numberOfLines={2}>
            {task?.title ?? 'Deep focus'}
          </Text>

          <View style={styles.timerWrapper}>
            <Svg width={SIZE} height={SIZE}>
              <Circle
                cx={SIZE / 2} cy={SIZE / 2} r={R}
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={STROKE}
              />
              <AnimatedCircle
                cx={SIZE / 2} cy={SIZE / 2} r={R}
                fill="none"
                stroke={ringColor}
                strokeWidth={STROKE}
                strokeDasharray={`${CIRC} ${CIRC}`}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                transform={`rotate(-90, ${SIZE / 2}, ${SIZE / 2})`}
              />
            </Svg>
            <View style={styles.timerCenter}>
              <Text style={styles.timerText}>{mins}:{secs}</Text>
              <Text style={styles.timerSubLabel}>{phase === 'work' ? 'remaining' : 'breathe'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <Animated.View
            pointerEvents="none"
            style={[styles.halo, { backgroundColor: brand.canvas, opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
          />
          <TouchableOpacity style={styles.playBtn} activeOpacity={0.85} onPress={() => setRunning(!running)}>
            <MaterialIcons name={running ? 'pause' : 'play-arrow'} size={34} color={brand.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryActions}>
          {phase === 'break' && (
            <TouchableOpacity style={styles.skipBtn} onPress={skipBreak}>
              <MaterialIcons name="skip-next" size={16} color="rgba(254,250,239,0.6)" />
              <Text style={styles.skipText}>Skip break</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.endBtn} onPress={endSession}>
            <Text style={styles.endText}>End session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LivingGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  phaseDot: { width: 7, height: 7, borderRadius: 4 },
  phaseLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: 'rgba(254,250,239,0.85)',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  taskName: {
    fontSize: 19,
    fontFamily: fonts.semibold,
    color: 'rgba(254,250,239,0.92)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 44,
    paddingHorizontal: 16,
  },
  timerWrapper: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
  },
  timerCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 54,
    fontFamily: fonts.bold,
    color: brand.canvas,
    lineHeight: 62,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  timerSubLabel: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: 'rgba(254,250,239,0.5)',
    marginTop: 2,
  },
  controls: {
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: brand.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  skipBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 },
  skipText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: 'rgba(254,250,239,0.6)',
  },
  endBtn: { padding: 10 },
  endText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: 'rgba(254,250,239,0.55)',
  },
});
