import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import GradientMesh from '../../components/ui/GradientMesh';
import { useAuth } from '../../lib/AuthContext';
import { useProfile, useUpdateProfile } from '../../lib/hooks/useProfile';
import { useStore } from '../../lib/store';
import { useMotion } from '../../lib/useMotion';
import { FOCUS_AREAS, DEFAULT_FOCUS_AREAS } from '../../lib/constants/areas';
import { colors, brand, fonts, radius, spacing } from '../../lib/theme';

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const AREAS = FOCUS_AREAS;

const STEPS = 3;

export default function Setup() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const setFocusAreas = useStore((s) => s.setFocusAreas);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const savedAreas = useStore((s) => s.focusAreas);
  const { animate } = useMotion();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(savedAreas ?? DEFAULT_FOCUS_AREAS);

  useEffect(() => {
    if (profile?.fullName && !name) setName(profile.fullName);
  }, [profile]);

  const anim = useRef(new Animated.Value(1)).current;
  const go = (next) => {
    if (!animate) { setStep(next); anim.setValue(1); return; }
    Animated.timing(anim, { toValue: 0, duration: 130, useNativeDriver: true }).start(() => {
      setStep(next);
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true, easing: easeOut }).start();
    });
  };

  const toggleArea = (key) =>
    setSelected((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));

  const canContinue = step === 0 ? name.trim().length > 0 : step === 1 ? selected.length > 0 : true;

  const onPrimary = () => {
    if (step < STEPS - 1) return go(step + 1);
    // Finish
    setFocusAreas(selected);
    setOnboarded(true);
    if (user && name.trim() && name.trim() !== profile?.fullName) {
      updateProfile.mutate({ fullName: name.trim() });
    }
    router.replace('/(tabs)');
  };

  const firstName = (name || profile?.fullName || '').split(' ')[0] || 'there';
  const contentStyle = {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };

  return (
    <GradientMesh variant="light" style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Top: back + progress */}
          <View style={styles.topBar}>
            {step > 0 ? (
              <TouchableOpacity onPress={() => go(step - 1)} hitSlop={10} style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={22} color={brand.ink} />
              </TouchableOpacity>
            ) : <View style={styles.backBtn} />}
            <View style={styles.dots}>
              {Array.from({ length: STEPS }).map((_, i) => (
                <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
              ))}
            </View>
            <View style={styles.backBtn} />
          </View>

          <Animated.View style={[styles.content, contentStyle]}>
            {step === 0 && (
              <>
                <Text style={styles.title}>What should we{'\n'}call you?</Text>
                <Text style={styles.sub}>This is how TaskFlow will greet you each day.</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.gray[400]}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => canContinue && go(1)}
                />
              </>
            )}

            {step === 1 && (
              <>
                <Text style={styles.title}>What do you{'\n'}want to focus on?</Text>
                <Text style={styles.sub}>Pick what matters to you. You can change this anytime.</Text>
                <View style={styles.grid}>
                  {AREAS.map((a) => {
                    const on = selected.includes(a.key);
                    return (
                      <TouchableOpacity
                        key={a.key}
                        style={[styles.areaCard, on && styles.areaCardOn]}
                        activeOpacity={0.85}
                        onPress={() => toggleArea(a.key)}
                      >
                        <View style={[styles.areaIcon, on && styles.areaIconOn]}>
                          <MaterialIcons name={a.icon} size={22} color={on ? brand.canvas : brand.ink} />
                        </View>
                        <Text style={[styles.areaLabel, on && styles.areaLabelOn]}>{a.label}</Text>
                        {on && (
                          <View style={styles.areaCheck}>
                            <MaterialIcons name="check" size={13} color={brand.canvas} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {step === 2 && (
              <View style={styles.finish}>
                <View style={styles.finishBadge}>
                  <MaterialIcons name="check" size={40} color={brand.canvas} />
                </View>
                <Text style={[styles.title, styles.centerText]}>You're all set,{'\n'}{firstName}.</Text>
                <Text style={[styles.sub, styles.centerText]}>Your calm command center is ready. Let's make today count.</Text>
              </View>
            )}
          </Animated.View>

          {/* Primary action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
              activeOpacity={0.9}
              disabled={!canContinue}
              onPress={onPrimary}
            >
              <Text style={styles.primaryBtnText}>
                {step < STEPS - 1 ? 'Continue' : 'Enter TaskFlow'}
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color={brand.canvas} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientMesh>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    paddingTop: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 22, height: 5, borderRadius: 3, backgroundColor: colors.gray[200] },
  dotActive: { backgroundColor: brand.ink },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  title: {
    fontSize: 30,
    fontFamily: fonts.bold,
    color: brand.ink,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  sub: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[600],
    lineHeight: 22,
    marginTop: 12,
  },
  input: {
    marginTop: 28,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    fontFamily: fonts.medium,
    color: brand.ink,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 28,
  },
  areaCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.gray[100],
    gap: 12,
  },
  areaCardOn: {
    borderColor: brand.ink,
    backgroundColor: '#FFFFFF',
  },
  areaIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaIconOn: { backgroundColor: brand.ink },
  areaLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: brand.ink,
  },
  areaLabelOn: { color: brand.ink },
  areaCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: brand.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finish: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  finishBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.success[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 12,
    paddingTop: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: brand.ink,
    paddingVertical: 17,
    borderRadius: radius.pill,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  centerText: { textAlign: 'center' },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: brand.canvas,
  },
});
