import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../utils/theme';
import { AppText } from './AppText';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  tint: string;
  iconColor?: string;
  onPress: () => void;
  compact?: boolean;
}

/** การ์ดเมนูสุขภาพ (ใช้ทั้งหน้าหลักและหน้าสุขภาพ) */
export function HealthCard({ icon, title, subtitle, tint, iconColor = colors.teal, onPress, compact }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        compact ? styles.compact : styles.card,
        { backgroundColor: tint },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.icon}>
        <Ionicons name={icon} size={compact ? 22 : 24} color={iconColor} />
      </View>
      <View style={compact ? { alignItems: 'center' } : { flex: 1 }}>
        <AppText variant={compact ? 'label' : 'subheading'} weight="semibold" center={compact}>
          {title}
        </AppText>
        {subtitle && !compact ? (
          <AppText variant="caption" color={colors.textSoft}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {!compact ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.lg },
  compact: { width: '30%', flexGrow: 1, alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 8, borderRadius: radius.lg },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
