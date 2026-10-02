import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { HeroIllustration } from '../assets/illustrations/HeroIllustration';
import { ActivityCard } from '../components/ActivityCard';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Cloud, Heart, Leaf } from '../components/Decorations';
import { HealthCard } from '../components/HealthCard';
import { ProgressCircle } from '../components/ProgressCircle';
import { Screen, SectionTitle } from '../components/Screen';
import { SleepCard } from '../components/SleepCard';
import { ErrorState } from '../components/States';
import { DEFAULT_SLEEP_PLAN, DEFAULT_USER } from '../data/defaults';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { useNow } from '../hooks/useNow';
import { useStoredValue } from '../hooks/useStoredValue';
import { RootStackParamList } from '../navigation/types';
import { activityService } from '../services/activityService';
import { timerService } from '../services/timerService';
import { STORAGE_KEYS } from '../storage/keys';
import { ScreenTimeSession, SleepPlan, SleepRecord, User } from '../types';
import { colors } from '../utils/theme';
import { formatCountdown, startOfDay, toDateKey } from '../utils/time';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const now = useNow(15000);
  const { activeSession, flow } = useBreakFlow();
  const user = useStoredValue<User>(STORAGE_KEYS.user, DEFAULT_USER);
  const sessions = useStoredValue<ScreenTimeSession[]>(STORAGE_KEYS.screenSessions, []);
  const sleepPlan = useStoredValue<SleepPlan>(STORAGE_KEYS.sleepPlan, DEFAULT_SLEEP_PLAN);
  const sleepRecords = useStoredValue<SleepRecord[]>(STORAGE_KEYS.sleepRecords, []);

  const todayStart = startOfDay(now);
  const usedSec = sessions.data
    .filter((s) => s.startTime >= todayStart)
    .reduce((sum, s) => sum + timerService.getUsedSeconds(s, now), 0);
  const usedMin = Math.round(usedSec / 60);
  const limit = user.data.dailyScreenLimitMin || 60;
  const todayActivity = activityService.activityOfTheDay();
  const todaySleep = sleepRecords.data.find((r) => r.date === toDateKey(now)) ?? null;
  const error = user.error || sessions.error || sleepPlan.error || sleepRecords.error;

  const onPrimary = () => {
    if (activeSession) navigation.navigate(activeSession.status === 'ringing' ? 'Alarm' : 'Timer');
    else if (flow.breakSession?.status === 'running') navigation.navigate('BreakMode');
    else navigation.navigate('SetScreenTime');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.cloudA}>
          <Cloud width={80} color={colors.softBlue} />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          {user.data.name ? (
            <AppText variant="caption" color={colors.teal}>
              สวัสดี {user.data.name} 👋
            </AppText>
          ) : null}
          <AppText variant="display" style={{ color: colors.tealDark }}>
            พักจอ พักกาย{'\n'}ใส่ใจสุขภาพ
          </AppText>
          <AppText variant="caption" color={colors.textSoft}>
            สุขภาพดี...เริ่มได้จากการดูแลตัวเองในทุกวัน
          </AppText>
        </View>
        <HeroIllustration size={128} />
      </View>

      {error ? <ErrorState message={error} onRetry={() => { user.reload(); sessions.reload(); sleepPlan.reload(); sleepRecords.reload(); }} /> : null}

      <Card tint={colors.mint} style={styles.usage}>
        <ProgressCircle size={110} strokeWidth={11} progress={usedMin / limit} trackColor={colors.white} color={usedMin > limit ? colors.peachDeep : colors.teal}>
          <AppText variant="heading">{usedMin}</AppText>
          <AppText variant="label" color={colors.textSoft}>
            / {limit} นาที
          </AppText>
        </ProgressCircle>
        <View style={{ flex: 1, gap: 6 }}>
          <AppText variant="subheading">เวลาการใช้โทรศัพท์วันนี้</AppText>
          <AppText variant="label" weight="regular" color={colors.textSoft}>
            นับจากตัวจับเวลาที่คุณตั้งในแอป (ไม่ใช่ Screen Time ของทั้งเครื่อง)
          </AppText>
          {activeSession ? (
            <AppText variant="caption" weight="semibold" color={colors.teal}>
              {activeSession.status === 'ringing'
                ? 'ถึงเวลาพักแล้ว!'
                : `เหลือ ${formatCountdown(timerService.getRemainingSec(flow.alarm?.endTime ?? activeSession.endTime, now))}`}
            </AppText>
          ) : null}
        </View>
      </Card>

      <Button
        title={activeSession ? 'ดูตัวจับเวลา' : flow.breakSession?.status === 'running' ? 'กลับไปพักหน้าจอ' : 'เริ่มใช้งาน'}
        icon={activeSession ? 'timer-outline' : 'leaf-outline'}
        size="lg"
        onPress={onPrimary}
      />

      <SectionTitle action={<Heart size={18} />}>ดูแลตัวเอง</SectionTitle>
      <View style={styles.grid}>
        <HealthCard compact icon="phone-portrait-outline" title="พักจอ" tint={colors.mint} onPress={() => navigation.navigate('Main', { screen: 'ScreenBreak' })} />
        <HealthCard compact icon="moon-outline" title="การนอน" tint={colors.lavender} iconColor={colors.lavenderDeep} onPress={() => navigation.navigate('Main', { screen: 'Sleep' })} />
        <HealthCard compact icon="water-outline" title="ประจำเดือน" tint={colors.peach} iconColor={colors.peachDeep} onPress={() => navigation.navigate('Menstrual')} />
        <HealthCard compact icon="nutrition-outline" title="โภชนาการ" tint={colors.cream} iconColor="#C08A2E" onPress={() => navigation.navigate('BMI')} />
        <HealthCard compact icon="walk-outline" title="กิจกรรมทางกาย" tint={colors.softBlue} iconColor={colors.softBlueDeep} onPress={() => navigation.navigate('Exercise')} />
        <HealthCard compact icon="person-circle-outline" title="โปรไฟล์" tint={colors.surface} onPress={() => navigation.navigate('Profile')} />
      </View>

      <SleepCard plan={sleepPlan.data} todayRecord={todaySleep} onPress={() => navigation.navigate('Main', { screen: 'Sleep' })} />

      <ActivityCard
        activity={todayActivity}
        onStart={() => navigation.navigate('Activity', { mode: 'standalone', activityId: todayActivity.id })}
      />
      <View style={styles.footer}>
        <Leaf size={22} rotate={-20} />
        <AppText variant="label" color={colors.textMuted}>
          ข้อมูลในแอปนี้เป็นความรู้สุขภาพทั่วไป ไม่ใช่การวินิจฉัยทางการแพทย์
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
  cloudA: { position: 'absolute', right: 96, top: -6, opacity: 0.9 },
  usage: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingHorizontal: 8 },
});
