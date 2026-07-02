import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useMotion } from '../../lib/useMotion';

// A living neo-gradient mesh. Layered radial "blobs" over a dark base, each on
// its own parallax depth. Motion comes from three sources, composed natively:
//   • drift  — a slow seamless loop so it's alive even when idle
//   • tilt   — device accelerometer (parallax by depth)
//   • touch  — drag to push the light around
// Tilt degrades gracefully if expo-sensors isn't available.

const BASE = { top: '#04060F', bottom: '#0C1430' };

// cx/cy/r in %, depth = parallax strength, ax/ay = drift amplitude (px),
// breathe = slow scale pulse. Layered for a deep, detailed neo mesh.
const BLOBS = [
  {
    key: 'sweep', cx: '28%', cy: '66%', r: '90%', depth: 1.1, ax: 24, ay: 20, breathe: true,
    stops: [['0', '#FFFFFF', 0.55], ['0.36', '#CFE2FB', 0.22], ['0.68', '#AFD2FA', 0.08], ['1', '#AFD2FA', 0]],
  },
  {
    key: 'ember', cx: '88%', cy: '7%', r: '54%', depth: 0.5, ax: 15, ay: 12,
    stops: [['0', '#D08A55', 0.55], ['0.45', '#B9915E', 0.2], ['1', '#B9915E', 0]],
  },
  {
    key: 'cool', cx: '80%', cy: '90%', r: '58%', depth: 0.7, ax: 16, ay: 14, breathe: true,
    stops: [['0', '#AFD2FA', 0.34], ['1', '#AFD2FA', 0]],
  },
  {
    key: 'deep', cx: '8%', cy: '12%', r: '48%', depth: 0.4, ax: 10, ay: 10,
    stops: [['0', '#2C3C80', 0.42], ['1', '#2C3C80', 0]],
  },
];

let _uid = 0;

export default function LivingGradient({ style, children, pointerEvents }) {
  const prefix = useRef(`lg${_uid++}`).current;
  const size = useRef({ w: 1, h: 1 }).current;

  // Accessibility: when motion is reduced, the mesh renders as a still image —
  // no drift loop, no breathing pulse, no accelerometer tilt, no touch parallax.
  const { reduce } = useMotion();
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  const drift = useRef(new Animated.Value(0)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const touchX = useRef(new Animated.Value(0)).current;
  const touchY = useRef(new Animated.Value(0)).current;

  const breathe = useRef(new Animated.Value(0)).current;

  // Continuous seamless drift loop.
  useEffect(() => {
    if (reduce) { drift.setValue(0); return; }
    const loop = Animated.loop(
      Animated.timing(drift, { toValue: 1, duration: 14000, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduce]);

  // Slow breathing pulse on the light layers — alive even when idle.
  useEffect(() => {
    if (reduce) { breathe.setValue(0); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 4200, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 4200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduce]);
  const breatheScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.09] });

  // Device tilt via accelerometer, low-pass filtered for smoothness.
  useEffect(() => {
    if (reduce) return;
    let sub;
    let sx = 0, sy = 0;
    let cancelled = false;
    (async () => {
      try {
        const { Accelerometer } = require('expo-sensors');
        const available = await Accelerometer.isAvailableAsync();
        if (!available || cancelled) return;
        Accelerometer.setUpdateInterval(60);
        sub = Accelerometer.addListener(({ x, y }) => {
          sx = sx * 0.82 + x * 0.18;
          sy = sy * 0.82 + y * 0.18;
          tiltX.setValue(-sx * 38);
          tiltY.setValue(sy * 38);
        });
      } catch (e) {
        // expo-sensors unavailable — drift + touch still work.
      }
    })();
    return () => {
      cancelled = true;
      sub?.remove?.();
    };
  }, [reduce]);

  // Touch / drag parallax. Only claims the gesture on actual movement so taps
  // pass through to children (buttons).
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_e, g) =>
        !reduceRef.current && Math.abs(g.dx) + Math.abs(g.dy) > 6,
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const nx = (locationX / size.w - 0.5) * 2;
        const ny = (locationY / size.h - 0.5) * 2;
        touchX.setValue(nx * 44);
        touchY.setValue(ny * 44);
      },
      onPanResponderRelease: () => {
        Animated.spring(touchX, { toValue: 0, useNativeDriver: true, speed: 6, bounciness: 6 }).start();
        Animated.spring(touchY, { toValue: 0, useNativeDriver: true, speed: 6, bounciness: 6 }).start();
      },
      onPanResponderTerminate: () => {
        touchX.setValue(0);
        touchY.setValue(0);
      },
    }),
  ).current;

  const layerTransform = (b) => {
    const driftX = drift.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [0, b.ax, 0, -b.ax, 0],
    });
    const driftY = drift.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [b.ay, 0, -b.ay, 0, b.ay],
    });
    const t = [
      { translateX: Animated.add(driftX, Animated.add(Animated.multiply(tiltX, b.depth), Animated.multiply(touchX, b.depth))) },
      { translateY: Animated.add(driftY, Animated.add(Animated.multiply(tiltY, b.depth), Animated.multiply(touchY, b.depth))) },
    ];
    if (b.breathe) t.push({ scale: breatheScale });
    return t;
  };

  return (
    <View
      style={[styles.root, style]}
      pointerEvents={pointerEvents}
      onLayout={(e) => { size.w = e.nativeEvent.layout.width; size.h = e.nativeEvent.layout.height; }}
      {...pan.panHandlers}
    >
      {/* Static dark base */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <LinearGradient id={`${prefix}-base`} x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor={BASE.top} />
            <Stop offset="1" stopColor={BASE.bottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${prefix}-base)`} />
      </Svg>

      {/* Parallax blob layers (overscanned so drift never reveals an edge) */}
      {BLOBS.map((b) => (
        <Animated.View
          key={b.key}
          pointerEvents="none"
          style={[styles.layer, { transform: layerTransform(b) }]}
        >
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <RadialGradient id={`${prefix}-${b.key}`} cx={b.cx} cy={b.cy} r={b.r}>
                {b.stops.map(([offset, color, op], i) => (
                  <Stop key={i} offset={offset} stopColor={color} stopOpacity={op} />
                ))}
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${prefix}-${b.key})`} />
          </Svg>
        </Animated.View>
      ))}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: BASE.bottom,
  },
  layer: {
    position: 'absolute',
    top: -70,
    left: -70,
    right: -70,
    bottom: -70,
  },
});
