import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PermissionBanner } from '../components/PermissionBanner';
import { PickerField } from '../components/PickerField';
import { Screen, ScreenHeader } from '../components/Screen';
import { InlineNotice } from '../components/States';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { colors, radius } from '../utils/theme';
import { formatClock, formatDurationThai } from '../utils/time';

type Option = 30 | 60 | 90 | 'custom' | 'test';

const PRESETS: { key: Option; label: string; sub: string }[] = [
  { key: 30, label: '30 นาที', sub: 'พักบ่อย ดีต่อสายตา' },
  { key: 60, label: '60 นาที', sub: 'แนะนำ' },
  { key: 90, label: '90 นาที', sub: 'สำหรับงาน/เรียน' },
  { key: 'custom', label: 'กำหนดเอง', sub: 'เลือกนาทีหรือเวลา' },
];

export function SetScreenTimeScreen() {
  const { startSession } = useBreakFlow();
  const [option, setOption] = useState<Option>(60);
  const [customMin, setCustomMin] = useState(45);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationSec =
    option === 'test' ? 30 : option === 'custom' ? customMin * 60 : (option as number) * 60;

  const onPickEndTime = (date: Date) => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(date.getHours(), date.getMinutes(), 0, 0);
    if (end.getTime() <= now.getTime()) end.setDate(end.getDate() + 1);
    const mins = Math.max(1, Math.round((end.getTime() - now.getTime()) / 60000));
    setCustomMin(Math.min(mins, 12 * 60));
  };

  const onStart = async () => {
    setBusy(true);
    setError(null);
    try {
      await startSession(durationSec);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เริ่มตัวจับเวลาไม่สำเร็จ');
      setBusy(false);
    }
  };

  const endAt = new Date(Date.now() + durationSec * 1000);

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader back title="ตั้งเวลาใช้โทรศัพท์" subtitle="เลือกระยะเวลาก่อนถึงเวลาพัก" />
      <PermissionBanner />

      <View style={styles.grid}>
        {PRESETS.map((p) => {
          const selected = option === p.key;
          return (
            <Pressable
              key={String(p.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={p.label}
              onPress={() => setOption(p.key)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <AppText variant="heading" color={selected ? colors.white : colors.text}>
                {p.label}
              </AppText>
              <AppText variant="label" weight="regular" color={selected ? colors.mint : colors.textSoft}>
                {p.sub}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {option === 'custom' ? (
        <Card style={{ gap: 14 }}>
          <AppText variant="subheading">กำหนดเอง</AppText>
          <View style={styles.stepper}>
            <Pressable
              accessibilityLabel="ลด 5 นาที"
              style={styles.stepBtn}
              onPress={() => setCustomMin((m) => Math.max(1, m - 5))}
            >
              <Ionicons name="remove" size={24} color={colors.teal} />
            </Pressable>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <AppText variant="display">{customMin}</AppText>
              <AppText variant="caption" color={colors.textSoft}>
                นาที ({formatDurationThai(customMin * 60)})
              </AppText>
            </View>
            <Pressable
              accessibilityLabel="เพิ่ม 5 นาที"
              style={styles.stepBtn}
              onPress={() => setCustomMin((m) => Math.min(720, m + 5))}
            >
              <Ionicons name="add" size={24} color={colors.teal} />
            </Pressable>
          </View>
          <PickerField
            label="หรือเลือกเวลาที่จะหยุดใช้โทรศัพท์"
            mode="time"
            value={endAt}
            display={`${formatClock(endAt)} น.`}
            onChange={onPickEndTime}
          />
        </Card>
      ) : null}

      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: option === 'test' }}
        onPress={() => setOption('test')}
        style={[styles.testRow, option === 'test' && { borderColor: colors.lavenderDeep, backgroundColor: colors.lavender }]}
      >
        <Ionicons name="flask-outline" size={20} color={colors.lavenderDeep} />
        <View style={{ flex: 1 }}>
          <AppText variant="caption" weight="semibold">
            โหมดทดสอบ 30 วินาที
          </AppText>
          <AppText variant="label" weight="regular" color={colors.textSoft}>
            ใช้ทดสอบการแจ้งเตือนตอนออกไปเปิดแอปอื่น
          </AppText>
        </View>
      </Pressable>

      <Card tint={colors.mint} style={styles.summary}>
        <Ionicons name="alarm-outline" size={22} color={colors.teal} />
        <AppText variant="caption" style={{ flex: 1 }}>
          จะเตือนให้พักเวลา <AppText variant="caption" weight="bold">{formatClock(endAt)} น.</AppText> ({formatDurationThai(durationSec)})
        </AppText>
      </Card>

      {error ? <InlineNotice tone="danger" title={error} /> : null}

      <Button title="เริ่ม" icon="play" size="lg" onPress={onStart} loading={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  option: {
    width: '47%',
    flexGrow: 1,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 2,
  },
  optionSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
