import { ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../lib/theme';

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
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.text, isDisabled && styles.disabledText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    backgroundColor: colors.primary[500],
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.gray[100],
  },
  text: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    letterSpacing: 0.15,
    lineHeight: 22,
  },
  disabledText: {
    color: colors.gray[400],
  },
});
