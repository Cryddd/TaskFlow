import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useStore } from './store';

// Single motion authority for the app. Motion is turned off when EITHER the OS
// "Reduce Motion" accessibility setting is on OR the user flips the in-app
// toggle. Animated surfaces read `reduce` to skip infinite loops and entrance
// choreography, and jump straight to their resting/final state instead.
//
// Uses core React Native AccessibilityInfo (not Reanimated) so it stays
// dependency-free and safe across architectures.
export function useMotion() {
  const [osReduced, setOsReduced] = useState(false);
  const userReduced = useStore((s) => s.reduceMotion);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => { if (mounted) setOsReduced(!!v); })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setOsReduced(!!v));
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  const reduce = osReduced || !!userReduced;
  return { reduce, animate: !reduce };
}
