import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

// Reusable soft atmospheric gradient mesh built from layered SVG radial
// gradients — no blur, no extra deps. Drop it behind any surface.
//
//   <GradientMesh variant="hero" radius={24} style={{ padding: 20 }}>
//     ...content...
//   </GradientMesh>

const VARIANTS = {
  // Deep-blue hero wash with a powder-blue glow (top-right) and a warm
  // sand glow (bottom-left) bleeding through.
  hero: {
    base: '#182350',
    blobs: [
      { cx: '55%', cy: '42%', r: '70%', color: '#26336E', opacity: 1 },
      { cx: '84%', cy: '10%', r: '58%', color: '#AFD2FA', opacity: 0.5 },
      { cx: '10%', cy: '95%', r: '62%', color: '#B9915E', opacity: 0.45 },
    ],
  },
  // Full-bleed welcome / onboarding atmosphere.
  welcome: {
    base: '#131C42',
    blobs: [
      { cx: '20%', cy: '18%', r: '70%', color: '#AFD2FA', opacity: 0.45 },
      { cx: '88%', cy: '70%', r: '65%', color: '#B9915E', opacity: 0.4 },
      { cx: '50%', cy: '108%', r: '75%', color: '#FEFAEF', opacity: 0.16 },
    ],
  },
  // Subtle light wash for headers on the floral canvas.
  light: {
    base: '#FEFAEF',
    blobs: [
      { cx: '85%', cy: '8%', r: '55%', color: '#AFD2FA', opacity: 0.32 },
      { cx: '8%', cy: '95%', r: '55%', color: '#B9915E', opacity: 0.18 },
    ],
  },
};

let _uid = 0;

export default function GradientMesh({
  variant = 'hero',
  radius = 0,
  style,
  children,
  pointerEvents,
}) {
  const v = VARIANTS[variant] ?? VARIANTS.hero;
  const prefix = useRef(`gm${_uid++}`).current;

  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]} pointerEvents={pointerEvents}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          {v.blobs.map((b, i) => (
            <RadialGradient key={i} id={`${prefix}-${i}`} cx={b.cx} cy={b.cy} r={b.r}>
              <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity} />
              <Stop offset="1" stopColor={b.color} stopOpacity="0" />
            </RadialGradient>
          ))}
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={v.base} />
        {v.blobs.map((b, i) => (
          <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#${prefix}-${i})`} />
        ))}
      </Svg>
      {children}
    </View>
  );
}
