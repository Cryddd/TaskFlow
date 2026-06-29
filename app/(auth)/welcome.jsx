import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import LivingGradient from '../../components/ui/LivingGradient';
import { brand, fonts, radius } from '../../lib/theme';

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const CHIPS = [
  { label: 'tasks',  bg: 'rgba(175,210,250,0.20)', color: '#CFE2FB', rotate: '-6deg' },
  { label: 'habits', bg: 'rgba(185,145,94,0.24)',  color: '#E7CBA6', rotate: '4deg'  },
  { label: 'focus',  bg: 'rgba(254,250,239,0.16)', color: '#FEFAEF', rotate: '-3deg' },
];

export default function Welcome() {
  const router = useRouter();
  const intro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 720, useNativeDriver: true, easing: easeOut }).start();
  }, []);

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

        {/* Decorative floating chips */}
        <Animated.View style={[styles.chips, rise(28)]}>
          {CHIPS.map((c) => (
            <View key={c.label} style={[styles.chip, { backgroundColor: c.bg, transform: [{ rotate: c.rotate }] }]}>
              <Text style={[styles.chipText, { color: c.color }]}>{c.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Headline */}
        <View style={styles.copy}>
          <Animated.Text style={[styles.title, rise(34)]}>
            Organize your day,{'\n'}the calm way.
          </Animated.Text>
          <Animated.Text style={[styles.sub, rise(44)]}>
            Tasks, habits, focus, and nutrition — one quiet command center that keeps you clear, not cluttered.
          </Animated.Text>
        </View>

        {/* Actions */}
        <Animated.View style={[styles.actions, rise(52)]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.9}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.primaryBtnText}>Get started</Text>
            <MaterialIcons name="arrow-forward" size={18} color={brand.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryText}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LivingGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 8,
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
  chips: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 22,
    paddingLeft: 4,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  chipText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
  copy: {
    marginBottom: 32,
  },
  title: {
    fontSize: 38,
    fontFamily: fonts.bold,
    color: brand.canvas,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  sub: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#C6CDE6',
    lineHeight: 23,
    marginTop: 16,
    paddingRight: 12,
  },
  actions: {
    marginBottom: 12,
    gap: 14,
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
    paddingVertical: 6,
  },
  secondaryText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: 'rgba(254,250,239,0.82)',
  },
});
