import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, radius } from '../utils/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Leaf } from './Decorations';

export function LoadingState({ message = 'กำลังโหลด...' }: { message?: string }) {
  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.teal} />
      <AppText variant="caption" color={colors.textSoft}>
        {message}
      </AppText>
    </View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[styles.box, styles.empty]}>
      <Leaf size={44} />
      <AppText variant="subheading" center>
        {title}
      </AppText>
      {message ? (
        <AppText variant="caption" color={colors.textSoft} center>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} size="sm" /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.box, styles.error]} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={36} color={colors.danger} />
      <AppText variant="subheading" center color={colors.danger}>
        เกิดข้อผิดพลาด
      </AppText>
      <AppText variant="caption" center color={colors.textSoft}>
        {message}
      </AppText>
      {onRetry ? <Button title="ลองอีกครั้ง" icon="refresh" onPress={onRetry} size="sm" variant="secondary" /> : null}
    </View>
  );
}

export function InlineNotice({
  tone = 'info',
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const map = {
    info: { bg: colors.softBlue, fg: colors.tealDark, icon: 'information-circle-outline' as const },
    warning: { bg: colors.warningSoft, fg: '#8A5A12', icon: 'warning-outline' as const },
    danger: { bg: colors.dangerSoft, fg: colors.danger, icon: 'notifications-off-outline' as const },
    success: { bg: colors.mint, fg: colors.teal, icon: 'checkmark-circle-outline' as const },
  }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: map.bg }]}>
      <Ionicons name={icon ?? map.icon} size={22} color={map.fg} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="caption" weight="semibold" color={map.fg}>
          {title}
        </AppText>
        {message ? (
          <AppText variant="label" weight="regular" color={colors.textSoft}>
            {message}
          </AppText>
        ) : null}
        {actionLabel && onAction ? (
          <Button title={actionLabel} onPress={onAction} size="sm" variant="secondary" style={{ alignSelf: 'flex-start', marginTop: 6 }} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  empty: { backgroundColor: colors.cream, borderRadius: radius.lg },
  error: { backgroundColor: colors.dangerSoft, borderRadius: radius.lg },
  notice: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: radius.md, alignItems: 'flex-start' },
});
