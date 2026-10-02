import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { SleepPlan, SleepRecord } from '../types';
import { colors } from '../utils/theme';
import { hhmmToMinutes, minutesToHHMM } from '../utils/time';
import { AppText } from './AppText';
import { Card } from './Card';

interface Props {
  plan: SleepPlan;
  todayRecord?: SleepRecord | null;
  onPress?: () => void;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  onPlan: { label: 'เข้านอนตามแผน', color: colors.teal },
  late: { label: 'เข้านอนช้ากว่าแผน', color: '#B9741F' },
  notRecorded: { label: 'ยังไม่ได้บันทึก', color: colors.textMuted },
};

export function SleepCard({ plan, todayRecord, onPress }: Props) {
  const prep = minutesToHHMM(hhmmToMinutes(plan.bedtime) - 30);
  const status = STATUS_LABEL[todayRecord?.status ?? 'notRecorded'];
  return (
    <Card tint={colors.lavender} onPress={onPress} accessibilityLabel="การนอน">
      <View style={styles.head}>
        <Ionicons name="moon" size={20} color={colors.lavenderDeep} />
        <AppText variant="subheading">การนอน</AppText>
      </View>
      <View style={styles.row}>
        <View style={styles.item}>
          <AppText variant="label" color={colors.textSoft}>
            เข้านอนที่แนะนำ
          </AppText>
          <AppText variant="heading">{plan.bedtime}</AppText>
        </View>
        <View style={styles.item}>
          <AppText variant="label" color={colors.textSoft}>
            เวลาตื่น
          </AppText>
          <AppText variant="heading">{plan.wakeTime}</AppText>
        </View>
      </View>
      <AppText variant="caption" color={colors.textSoft}>
        เริ่มเตรียมตัวนอนและวางจอตั้งแต่ {prep} น.
      </AppText>
      <View style={styles.status}>
        <View style={[styles.dot, { backgroundColor: status.color }]} />
        <AppText variant="caption" weight="semibold" color={status.color}>
          สถานะคืนนี้: {status.label}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  item: { flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 12 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
