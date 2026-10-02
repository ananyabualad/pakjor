import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { colors, fonts } from '../utils/theme';

type Variant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

interface Props extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: string;
  center?: boolean;
}

const variantStyle: Record<Variant, TextStyle> = {
  display: { fontSize: 30, lineHeight: 44 },
  title: { fontSize: 24, lineHeight: 36 },
  heading: { fontSize: 20, lineHeight: 30 },
  subheading: { fontSize: 17, lineHeight: 26 },
  body: { fontSize: 16, lineHeight: 25 },
  caption: { fontSize: 14, lineHeight: 21 },
  label: { fontSize: 13, lineHeight: 19 },
};

const defaultWeight: Record<Variant, Weight> = {
  display: 'bold',
  title: 'bold',
  heading: 'bold',
  subheading: 'semibold',
  body: 'regular',
  caption: 'regular',
  label: 'medium',
};

/** Text ที่ใช้ฟอนต์ Noto Sans Thai (ต้องแยก family ตามน้ำหนัก บน Android) */
export function AppText({ variant = 'body', weight, color, center, style, ...rest }: Props) {
  const w = weight ?? defaultWeight[variant];
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        variantStyle[variant],
        { fontFamily: fonts[w], color: color ?? colors.text },
        center && styles.center,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
  center: { textAlign: 'center' },
});
