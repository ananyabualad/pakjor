import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Cloud, Heart, Leaf, Sparkle } from '../components/Decorations';
import { Screen } from '../components/Screen';
import { ErrorState, LoadingState } from '../components/States';
import { StatCard } from '../components/StatCard';
import { CATEGORY_LABEL } from '../data/activities';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { goToMain, resetTo } from '../navigation/navigationRef';
import { StatsSummary, statsService } from '../services/statsService';
import { ActivityCategory } from '../types';
import { colors } from '../utils/theme';
import { formatDurationThai } from '../utils/time';

const CATS: ActivityCategory[] = ['stretching', 'walking', 'breathing', 'hydration'];

export function BreakCompleteScreen() {
  const { lastCompletedBreak } = useBreakFlow();
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setSummary(await statsService.getToday());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดสรุปไม่สำเร็จ');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const early = lastCompletedBreak?.status === 'cancelled';

  return (
    <Screen edges={['top', 'bottom']} background={colors.mint}>
      <View style={styles.hero}>
        <View style={styles.deco}>
          <Cloud width={80} />
          <Sparkle size={20} />
        </View>
        <Heart size={44} />
        <AppText variant="display" center>
          {early ? 'จบการพักแล้ว' : 'พักสำเร็จ! 🎉'}
        </AppText>
        <AppText variant="body" color={colors.textSoft} center>
          {early
            ? `พักไป ${formatDurationThai(lastCompletedBreak?.actualDuration ?? 0)} — ครั้งหน้าลองพักให้ครบนะ`
            : 'ดวงตาและร่างกายได้พักแล้ว เก่งมาก!'}
        </AppText>
      </View>

      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!summary && !error ? <LoadingState message="กำลังสรุปผลวันนี้..." /> : null}

      {summary ? (
        <>
          <Card style={{ gap: 10 }}>
            <View style={styles.row}>
              <Leaf size={22} />
              <AppText variant="subheading">กิจกรรมวันนี้</AppText>
            </View>
            {CATS.filter((c) => summary.byCategory[c] > 0).length === 0 ? (
              <AppText variant="caption" color={colors.textSoft}>
                ยังไม่มีกิจกรรมที่ทำสำเร็จวันนี้
              </AppText>
            ) : (
              CATS.filter((c) => summary.byCategory[c] > 0).map((c) => (
                <View key={c} style={styles.line}>
                  <AppText>{CATEGORY_LABEL[c]}</AppText>
                  <AppText weight="bold" color={colors.teal}>
                    {summary.byCategory[c]} ครั้ง
                  </AppText>
                </View>
              ))
            )}
          </Card>
          <View style={styles.stats}>
            <StatCard icon="time-outline" label="เวลาพักรวมวันนี้" value={formatDurationThai(summary.totalBreakSeconds)} tint={colors.white} />
            <StatCard icon="checkmark-circle-outline" label="พักจอสำเร็จ" value={`${summary.breakRounds} รอบ`} tint={colors.white} />
          </View>
        </>
      ) : null}

      <Button title="เริ่มรอบใหม่" icon="refresh" size="lg" onPress={() => resetTo('SetScreenTime')} />
      <Button title="กลับหน้าหลัก" variant="secondary" onPress={() => goToMain('Home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 6, paddingTop: 16 },
  deco: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  stats: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
});
