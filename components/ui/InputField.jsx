import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../../lib/theme';

export default function InputField({
  label,
  error,
  style,
  inputStyle,
  multiline,
  secureTextEntry,
  showSecureToggle,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(showSecureToggle ? true : secureTextEntry);

  const isSecure = showSecureToggle ? hidden : secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multiline,
            focused && styles.focused,
            error && styles.errored,
            showSecureToggle && styles.inputWithIcon,
            inputStyle,
          ]}
          placeholderTextColor={colors.gray[200]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          secureTextEntry={isSecure}
          {...props}
        />
        {showSecureToggle && (
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setHidden((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name={hidden ? 'visibility-off' : 'visibility'} size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  inputRow: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: 14 },
  inputWithIcon: { paddingRight: 44 },
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
