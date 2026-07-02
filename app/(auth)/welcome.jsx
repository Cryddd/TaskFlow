import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import LivingGradient from '../../components/ui/LivingGradient';
import { useMotion } from '../../lib/useMotion';
import { brand, fonts, radius } from '../../lib/theme';

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IO = Easing.inOut(Easing.quad);

// Tactile feature chips — icon + label, each with a slight tilt + float phase.
const FEATURES = [
  { label: 'Tasks',     icon: 'checklist',             rotate: '-5deg', tint: 'rgba(175,210,250,0.22)', color: '#CFE2FB' },
  { label: 'Habits',    icon: 'local-fire-department', rotate: '4deg',  tint: 'rgba(185,145,94,0.26)',  color: '#E7CBA6' },
  { label: 'Focus',     icon: 'timer',                 rotate: '-3deg', tint: 'rgba(254,250,239,0.16)', color: '#FEFAEF' },
  { label: 'Nutrition', icon: 'restaurant',            rotate: '5deg',  tint: 'rgba(175,210,250,0.18)', color: '#CFE2FB' },
];

export default function Welcome() {
  const router = useRouter();
  const { animate } = useMotion();

  // Staggered entrance.
  const intro = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animate) { intro.setValue(1); return; }
    Animated.timing(intro, { toValue: 1, duration: 720, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [animate]);

  // Gentle floating on the chips — alive even when the device is still.
  const bob = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    if (!animate) return;
    const loops = bob.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 1900 + i * 260, delay: i * 160, easing: EASE_IO, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 1900 + i * 260, easing: EASE_IO, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [animate]);

  const rise = (from) => ({
    opacity: intro,
    transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
  });

  return (
    <LivingGradient style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Brand */}
        <Animated.View style={[styles.brandRow, rise(10)]}>
          <View style={styles.brandDot}>
            <MaterialIcons name="bolt" size={16} color={brand.ink} />
          </View>
          <Text style={styles.brand}>TaskFlow</Text>
        </Animated.View>

        {/* Hero copy */}
        <View style={styles.hero}>
          <Animated.View style={[styles.eyebrow, rise(20)]}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>YOUR CALM COMMAND CENTER</Text>
          </Animated.View>

          <Animated.Text style={[styles.title, rise(30)]}>
            Organize your day,{'\n'}
            <Text style={styles.titleAccent}>the calm way.</Text>
          </Animated.Text>

          <Animated.Text style={[styles.sub, rise(40)]}>
            Tasks, habits, focus and nutrition — one quiet space that keeps you clear, not cluttered.
          </Animated.Text>
        </View>

        {/* Floating feature chips */}
        <Animated.View style={[styles.chips, rise(48)]}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.label}
              style={[
                styles.chip,
                {
                  backgroundColor: f.tint,
                  transform: [
                    { rotate: f.rotate },
                    { translateY: bob[i].interpolate({ inputRange: [0, 1], outputRange: [0, -9] }) },
                  ],
                },
              ]}
            >
              <MaterialIcons name={f.icon} size={15} color={f.color} />
              <Text style={[styles.chipText, { color: f.color }]}>{f.label}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actions, rise(56)]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.9}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.primaryBtnText}>Get started — it's free</Text>
            <MaterialIcons name="arrow-forward" size={18} color={brand.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryText}>
              I already have an account <Text style={styles.secondaryLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LivingGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: 26,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 10,
  },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: brand.powder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: brand.canvas,
  },

  // Hero pinned toward the lower third; chips + actions below.
  hero: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(254,250,239,0.10)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 18,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.powder,
  },
  eyebrowText: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: '#CFE2FB',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 40,
    fontFamily: fonts.bold,
    color: brand.canvas,
    lineHeight: 46,
    letterSpacing: -1,
  },
  titleAccent: {
    color: brand.powder,
    fontFamily: fonts.bold,
  },
  sub: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#C6CDE6',
    lineHeight: 23,
    marginTop: 16,
    paddingRight: 8,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 26,
    paddingLeft: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(254,250,239,0.14)',
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },

  actions: {
    marginBottom: 14,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: brand.canvas,
    paddingVertical: 17,
    borderRadius: radius.pill,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: brand.ink,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: 'rgba(254,250,239,0.72)',
  },
  secondaryLink: {
    fontFamily: fonts.semibold,
    color: brand.canvas,
  },
});
