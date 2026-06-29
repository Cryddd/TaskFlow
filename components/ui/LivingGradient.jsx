import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect } from 'react-native-svg';

// A living neo-gradient mesh. Layered radial "blobs" over a dark base, each on
// its own parallax depth. Motion comes from three sources, composed natively:
//   • drift  — a slow seamless loop so it's alive even when idle
//   • tilt   — device accelerometer (parallax by depth)
//   • touch  — drag to push the light around
// Tilt degrades gracefully if expo-sensors isn't available.

const BASE = { top: '#060A1A', bottom: '#111B3E' };

// cx/cy/r in %, depth = parallax strength, ax/ay = drift amplitude (px).
const BLOBS = [
  {
    key: 'sweep', cx: '30%', cy: '62%', r: '78%', depth: 1.0, ax: 18, ay: 15,
    stops: [['0', '#FFFFFF', 0.42], ['0.45', '#AFD2FA', 0.18], ['1', '#AFD2FA', 0]],
  },
  {
    key: 'cool', cx: '86%', cy: '13%', r: '56%', depth: 0.6, ax: 13, ay: 11,
    stops: [['0', '#AFD2FA', 0.5], ['1', '#AFD2FA', 0]],
  },
  {
    key: 'ember', cx: '92%', cy: '95%', r: '50%', depth: 0.35, ax: 9, ay: 9,
    stops: [['0', '#C2854A', 0.5], ['0.5', '#B9915E', 0.2], ['1', '#B9915E', 0]],
  },
];

let _uid = 0;

export default function LivingGradient({ style, children, pointerEvents }) {
  const prefix = useRef(`lg${_uid++}`).current;
  const size = useRef({ w: 1, h: 1 }).current;

  const drift = useRef(new Animated.Value(0)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const touchX = useRef(new Animated.Value(0)).current;
  const touchY = useRef(new Animated.Value(0)).current;

  // Continuous seamless drift loop.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(drift, { toValue: 1, duration: 14000, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Device tilt via accelerometer, low-pass filtered for smoothness.
  useEffect(() => {
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
          tiltX.setValue(-sx * 26);
          tiltY.setValue(sy * 26);
        });
      } catch (e) {
        // expo-sensors unavailable — drift + touch still work.
      }
    })();
    return () => {
      cancelled = true;
      sub?.remove?.();
    };
  }, []);

  // Touch / drag parallax. Only claims the gesture on actual movement so taps
  // pass through to children (buttons).
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) + Math.abs(g.dy) > 6,
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const nx = (locationX / size.w - 0.5) * 2;
        const ny = (locationY / size.h - 0.5) * 2;
        touchX.setValue(nx * 30);
        touchY.setValue(ny * 30);
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
    return [
      { translateX: Animated.add(driftX, Animated.add(Animated.multiply(tiltX, b.depth), Animated.multiply(touchX, b.depth))) },
      { translateY: Animated.add(driftY, Animated.add(Animated.multiply(tiltY, b.depth), Animated.multiply(touchY, b.depth))) },
    ];
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
