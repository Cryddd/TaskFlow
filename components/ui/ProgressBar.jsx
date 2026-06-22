import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../lib/theme';

export default function ProgressBar({ progress = 0, label, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(1, Math.max(0, progress)),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolate }]} />
      </View>
      {label != null && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    textAlign: 'right',
    lineHeight: 16,
  },
});
