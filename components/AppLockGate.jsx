import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useStore } from '../lib/store';
import { brand, fonts, radius } from '../lib/theme';
import GradientMesh from './ui/GradientMesh';

// Gates the whole app behind biometric/passcode auth when App Lock is enabled.
// Locks on cold start and whenever the app returns from the background.
export default function AppLockGate({ children }) {
  const appLock = useStore((s) => s.appLock);

  // Start locked if App Lock is already on at mount (the app only renders after
  // prefs hydrate, so this snapshot is accurate) — avoids a flash of content.
  // We intentionally do NOT lock when the user *enables* the toggle mid-session;
  // it takes effect on the next background return / cold start.
  const [locked, setLocked] = useState(() => useStore.getState().appLock);
  const [authing, setAuthing] = useState(false);
  const appState = useRef(AppState.currentState);

  // Re-lock when coming back to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appState.current;
      appState.current = next;
      if (appLock && /inactive|background/.test(prev) && next === 'active') {
        setLocked(true);
      }
    });
    return () => sub.remove();
  }, [appLock]);

  const authenticate = async () => {
    if (authing) return;
    setAuthing(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock TaskFlow',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use passcode',
      });
      if (result.success) setLocked(false);
    } catch {
      // Stay locked; the user can retry with the Unlock button.
    } finally {
      setAuthing(false);
    }
  };

  // Prompt automatically the moment we lock.
  useEffect(() => {
    if (locked) authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  return (
    <View style={styles.root}>
      {children}
      {locked && (
        <GradientMesh variant="welcome" style={StyleSheet.absoluteFill}>
          <View style={styles.content}>
            <View style={styles.lockIcon}>
              <MaterialIcons name="lock" size={32} color={brand.canvas} />
            </View>
            <Text style={styles.title}>TaskFlow is locked</Text>
            <Text style={styles.sub}>Authenticate to continue</Text>
            <TouchableOpacity
              style={styles.unlockBtn}
              onPress={authenticate}
              activeOpacity={0.9}
              disabled={authing}
            >
              <MaterialIcons name="fingerprint" size={20} color={brand.ink} />
              <Text style={styles.unlockText}>Unlock</Text>
            </TouchableOpacity>
          </View>
        </GradientMesh>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  lockIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: brand.canvas,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#C6CDE6',
    marginBottom: 22,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: brand.canvas,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  unlockText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: brand.ink,
  },
});
