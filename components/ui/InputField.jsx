import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../lib/theme';

export default function InputField({
  label,
  error,
  style,
  inputStyle,
  multiline,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
          error && styles.errored,
          inputStyle,
        ]}
        placeholderTextColor={colors.gray[200]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        multiline={multiline}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
    lineHeight: 18,
  },
  input: {
    height: 48,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    lineHeight: 22,
  },
  multiline: {
    height: undefined,
    minHeight: 80,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  errored: {
    borderColor: colors.danger[400],
  },
  errorText: {
    fontSize: 12,
    color: colors.danger[400],
    lineHeight: 16,
  },
});
