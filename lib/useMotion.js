import { useReducedMotion } from 'react-native-reanimated';
import { useStore } from './store';

// Single motion authority for the app. Motion is turned off when EITHER the OS
// "Reduce Motion" accessibility setting is on OR the user flips the in-app
// toggle. Animated surfaces read `reduce` to skip infinite loops and entrance
// choreography, and jump straight to their resting/final state instead.
export function useMotion() {
  const osReduced = useReducedMotion();
  const userReduced = useStore((s) => s.reduceMotion);
  const reduce = !!osReduced || !!userReduced;
  return { reduce, animate: !reduce };
}
