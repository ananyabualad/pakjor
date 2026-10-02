import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius } from '../utils/theme';
import { AppText } from './AppText';

interface Props extends TextInputProps {
  label: string;
  suffix?: string;
  error?: string | null;
}

export function FormField({ label, suffix, error, style, ...rest }: Props) {
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <AppText variant="label" color={colors.textSoft}>
        {label}
      </AppText>
      <View style={[styles.inputWrap, error ? { borderColor: colors.danger } : null]}>
        <TextInput
          {...rest}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
        />
        {suffix ? (
          <AppText variant="caption" color={colors.textMuted}>
            {suffix}
          </AppText>
        ) : null}
      </View>
      {error ? (
        <AppText variant="label" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    minHeight: 50,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.text, paddingVertical: 10 },
});
