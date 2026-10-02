import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { BarChart } from '../components/BarChart';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { ProgressCircle } from '../components/ProgressCircle';
import { Screen, ScreenHeader, SectionTitle } from '../components/Screen';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { StatCard } from '../components/StatCard';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { goToMain } from '../navigation/navigationRef';
import { StatsRange, StatsSummary, statsService } from '../services/statsService';
import { colors } from '../utils/theme';
import { formatDurationThai } from '../utils/time';

const RANGES: { key: StatsRange; label: string; days: number }[] = [
  { key: 'daily', label: 'วันนี้', days: 1 },
  { key: 'weekly', label: '7 วัน', days: 7 },
  { key: 'monthly', label: '30 วัน', days: 30 },
];

export function StatsScreen() {
  const { settings, updateSettings } = useBreakFlow();
  const [range, setRange] = useState<StatsRange>('daily');
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (r: StatsRange) => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await statsService.getSummary(r));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดสถิติไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(range);
    }, [load, range]),
  );

  const days = RANGES.find((r) => r.key === range)!.days;
  const goal = settings.dailyBreakGoal * days;
  const progress = summary ? Math.min(1, summary.breakRounds / Math.max(1, goal)) : 0;
  const empty = summary && summary.breakRounds === 0 && summary.activitiesCompleted === 0 && summary.totalBreakSeconds === 0;

  return (
    <Screen>
      <ScreenHeader title="สถิติ" subtitle="ความก้าวหน้าในการพักจอและขยับร่างกาย" />
      <View style={styles.tabs}>
        {RANGES.map((r) => (
          <Chip key={r.key} label={r.label} selected={range === r.key} onPress={() => setRange(r.key)} />
        ))}
      </View>

      {error ? <ErrorState message={error} onRetry={() => load(range)} /> : null}
      {loading && !summary ? <LoadingState /> : null}

      {summary && !error ? (
        empty ? (
          <EmptyState
            title="ยังไม่มีข้อมูลในช่วงนี้"
            message="เริ่มตั้งเวลาใช้โทรศัพท์และพักจอครบหนึ่งรอบ สถิติจะแสดงที่นี่"
            actionLabel="ไปที่พักจอ"
            onAction={() => goToMain('ScreenBreak')}
          />
        ) : (
          <>
            <Card tint={colors.mint} style={styles.hero}>
              <ProgressCircle size={110} strokeWidth={12} progress={progress} color={colors.teal} trackColor={colors.white}>
                <AppText variant="heading">{Math.round(progress * 100)}%</AppText>
              </ProgressCircle>
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="heading">พักจอสำเร็จ {summary.breakRounds} รอบ</AppText>
                <AppText variant="caption" color={colors.textSoft}>
                  เป้าหมาย {goal} รอบ ({settings.dailyBreakGoal} รอบ/วัน)
                </AppText>
                <AppText variant="caption" color={colors.textSoft}>
                  เวลาพักรวม {formatDurationThai(summary.totalBreakSeconds)}
                </AppText>
              </View>
            </Card>

            <View style={styles.grid}>
              <StatCard icon="checkmark-done-outline" label="กิจกรรมสำเร็จ" value={`${summary.activitiesCompleted} ครั้ง`} tint={colors.softBlue} iconColor={colors.softBlueDeep} />
              <StatCard icon="body-outline" label="ยืดเส้น" value={`${summary.byCategory.stretching} ครั้ง`} tint={colors.peach} iconColor={colors.peachDeep} />
              <StatCard icon="walk-outline" label="เดิน" value={`${summary.byCategory.walking} ครั้ง`} tint={colors.mint} />
              <StatCard icon="leaf-outline" label="ฝึกหายใจ" value={`${summary.byCategory.breathing} ครั้ง`} tint={colors.lavender} iconColor={colors.lavenderDeep} />
              <StatCard icon="water-outline" label="ดื่มน้ำ" value={`${summary.byCategory.hydration} ครั้ง`} tint={colors.softBlue} iconColor={colors.softBlueDeep} />
              <StatCard icon="calendar-outline" label="วันที่ใช้งาน" value={`${summary.activeDays} วัน`} tint={colors.cream} iconColor="#C08A2E" />
            </View>

            <SectionTitle>{range === 'daily' ? 'รอบพักตามช่วงเวลา' : 'รอบพักรายวัน'}</SectionTitle>
            <Card>
              <BarChart data={summary.series} labelEvery={range === 'monthly' ? 5 : 1} />
            </Card>

            <Card tint={colors.cream} style={{ gap: 4 }}>
              <AppText variant="subheading">เวลาใช้โทรศัพท์ตาม Timer</AppText>
              <AppText variant="heading">{formatDurationThai(summary.timedPhoneSeconds)}</AppText>
              <AppText variant="label" color={colors.textSoft}>
                นับเฉพาะช่วงที่คุณตั้ง Timer ในแอปนี้ ไม่ใช่ Screen Time จริงของทั้งเครื่อง
              </AppText>
            </Card>
          </>
        )
      ) : null}

      <SectionTitle>เป้าหมายรอบพักต่อวัน</SectionTitle>
      <View style={styles.tabs}>
        {[2, 4, 6, 8].map((g) => (
          <Chip key={g} label={`${g} รอบ`} selected={settings.dailyBreakGoal === g} onPress={() => updateSettings({ dailyBreakGoal: g })} color={colors.lavenderDeep} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
