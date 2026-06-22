import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pause, Play, SkipForward, X } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../lib/theme';

const POMODORO_MINS = 25;
const BREAK_MINS = 5;

export default function FocusModeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tasks } = useStore();

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

  const SIZE = 200;
  const STROKE = 6;
  const R = (SIZE - STROKE * 2) / 2;
  const CIRC = 2 * Math.PI * R;
  const strokeDashoffset = CIRC * (1 - progress);

  const skipBreak = () => {
    clearInterval(timerRef.current);
    setPhase('work');
    setTotalSecs(POMODORO_MINS * 60);
    setRemaining(POMODORO_MINS * 60);
    setRunning(false);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Close */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <Text style={styles.phaseLabel}>{phase === 'work' ? 'Focus Session' : '☕ Short Break'}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Task name */}
        <Text style={styles.taskName} numberOfLines={2}>
          {task?.title ?? 'Focus Session'}
        </Text>

        {/* Timer Ring */}
        <View style={styles.timerWrapper}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={STROKE}
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={phase === 'work' ? colors.primary[400] : colors.success[400]}
              strokeWidth={STROKE}
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90, ${SIZE / 2}, ${SIZE / 2})`}
            />
          </Svg>
          <View style={styles.timerCenter}>
            <Text style={styles.timerText}>{mins}:{secs}</Text>
            <Text style={styles.timerSubLabel}>{phase === 'work' ? 'remaining' : 'break'}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.playBtn} onPress={() => setRunning(!running)}>
            {running
              ? <Pause size={32} color="#FFFFFF" />
              : <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
            }
          </TouchableOpacity>
        </View>

        {/* Secondary actions */}
        <View style={styles.secondaryActions}>
          {phase === 'break' && (
            <TouchableOpacity style={styles.skipBtn} onPress={skipBreak}>
              <SkipForward size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.skipText}>Skip break</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.endBtn} onPress={() => router.back()}>
            <Text style={styles.endText}>End session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary[900],
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 16,
  },
  phaseLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  taskName: {
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  timerWrapper: {
    width: 200,
    height: 200,
    position: 'relative',
    marginBottom: 48,
  },
  timerCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    lineHeight: 56,
    fontVariant: ['tabular-nums'],
  },
  timerSubLabel: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
  },
  controls: {
    marginBottom: 40,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
  },
  skipText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 19,
  },
  endBtn: { padding: 10 },
  endText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 19,
  },
});
