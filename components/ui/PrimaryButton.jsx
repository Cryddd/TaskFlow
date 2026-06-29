import { ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, brand, fonts, radius } from '../../lib/theme';

export default function PrimaryButton({ title, onPress, loading, disabled, style }) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={brand.canvas} />
      ) : (
        <Text style={[styles.text, isDisabled && styles.disabledText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    backgroundColor: brand.ink,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.gray[200],
  },
  text: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: brand.canvas,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  disabledText: {
    color: colors.gray[400],
  },
});
