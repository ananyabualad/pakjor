import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIllustration } from '../assets/illustrations/ActivityIllustration';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Heart, Sparkle } from '../components/Decorations';
import { Screen, ScreenHeader } from '../components/Screen';
import { InlineNotice } from '../components/States';
import { Timer } from '../components/Timer';
import { CATEGORY_LABEL, getActivityById } from '../data/activities';
import { useNow } from '../hooks/useNow';
import { goToMain, resetTo } from '../navigation/navigationRef';
import { RootStackParamList } from '../navigation/types';
import { activityService } from '../services/activityService';
import { soundService } from '../services/soundService';
import { statsService } from '../services/statsService';
import { timerService } from '../services/timerService';
import { Activity, ActivitySession } from '../types';
import { createId } from '../utils/id';
import { colors } from '../utils/theme';

type Phase = 'ready' | 'running' | 'done';

export function ActivityScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Activity'>>();
  const mode = route.params?.mode ?? 'standalone';
  const [activity, setActivity] = useState<Activity>(
    () => (route.params?.activityId && getActivityById(route.params.activityId)) || activityService.randomActivity(),
  );
  const [phase, setPhase] = useState<Phase>('ready');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const finishing = useRef(false);
  const now = useNow(250);

  const remaining = endAt ? timerService.getRemainingSec(endAt, now) : activity.duration;

  useEffect(() => {
    if (phase !== 'running' || !endAt || !startedAt || finishing.current) return;
    if (timerService.isExpired(endAt, now)) {
      finishing.current = true;
      const session: ActivitySession = {
        id: createId('act'),
        activityId: activity.id,
        category: activity.category,
        startedAt,
        completedAt: Date.now(),
        duration: activity.duration,
        completed: true,
        source: mode === 'flow' ? 'break-flow' : 'standalone',
      };
      statsService
        .recordActivity(session)
        .catch((e) => setSaveError(e instanceof Error ? e.message : 'บันทึกสถิติไม่สำเร็จ'));
      soundService.playEffect('success');
      setPhase('done');
    }
  }, [phase, endAt, now, startedAt, activity, mode]);

  const start = () => {
    const t = Date.now();
    finishing.current = false;
    setStartedAt(t);
    setEndAt(t + activity.duration * 1000);
    setPhase('running');
  };

  const shuffle = () => setActivity(activityService.randomActivity(activity.id));

  const next = () => {
    if (mode === 'flow') resetTo('BreakMode');
    else goToMain('Home');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader
        back={mode === 'standalone'}
        title={phase === 'done' ? 'ทำกิจกรรมสำเร็จ! 🎉' : `${activity.name} 1 นาที`}
        subtitle={mode === 'flow' ? 'ขยับร่างกายก่อนพักหน้าจอ' : CATEGORY_LABEL[activity.category]}
      />

      <View style={styles.center}>
        {phase === 'running' ? (
          <Timer
            remainingSec={remaining}
            progress={endAt && startedAt ? timerService.getProgress(startedAt, endAt, now) : 0}
            label={activity.name}
            size={230}
            color={colors.peachDeep}
            trackColor={colors.peach}
          />
        ) : (
          <View>
            <ActivityIllustration kind={activity.illustration} size={210} />
            {phase === 'done' ? (
              <View style={styles.sparkles}>
                <Sparkle size={22} />
                <Heart size={26} />
                <Sparkle size={16} color={colors.mintDeep} />
              </View>
            ) : null}
          </View>
        )}
        {phase === 'ready' ? (
          <AppText variant="display" style={{ fontSize: 44, lineHeight: 58 }}>
            01:00
          </AppText>
        ) : null}
      </View>

      {phase === 'done' ? (
        <Card tint={colors.mint} style={{ gap: 6, alignItems: 'center' }}>
          <AppText variant="heading" center>
            เยี่ยมมาก! คุณ{activity.name}ครบ 1 นาทีแล้ว
          </AppText>
          <AppText variant="caption" color={colors.textSoft} center>
            {mode === 'flow' ? 'ต่อไปมาพักสายตาจากหน้าจอกัน' : 'ร่างกายได้ขยับแล้ว ทำต่อเนื่องทุกวันนะ'}
          </AppText>
        </Card>
      ) : (
        <Card style={{ gap: 8 }}>
          <AppText variant="subheading">{activity.description}</AppText>
          {activity.steps.map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={styles.num}>
                <AppText variant="label" color={colors.teal}>
                  {i + 1}
                </AppText>
              </View>
              <AppText variant="caption" style={{ flex: 1 }}>
                {s}
              </AppText>
            </View>
          ))}
        </Card>
      )}

      {saveError ? <InlineNotice tone="danger" title={saveError} /> : null}

      {phase === 'ready' ? (
        <>
          <Button title="เริ่มกิจกรรม" icon="play" size="lg" onPress={start} />
          <Button title="สุ่มกิจกรรมใหม่" icon="shuffle" variant="secondary" onPress={shuffle} />
          {mode === 'flow' ? <Button title="ข้ามไปพักหน้าจอ" variant="ghost" onPress={next} /> : null}
        </>
      ) : null}
      {phase === 'running' ? (
        <Button
          title="หยุด"
          variant="ghost"
          onPress={() => {
            setPhase('ready');
            setEndAt(null);
          }}
        />
      ) : null}
      {phase === 'done' ? (
        <>
          <Button title={mode === 'flow' ? 'เข้าสู่การพักหน้าจอ' : 'กลับหน้าหลัก'} icon="arrow-forward" size="lg" onPress={next} />
          {mode === 'standalone' ? (
            <Button title="ทำอีกกิจกรรม" variant="secondary" onPress={() => { shuffle(); setPhase('ready'); setEndAt(null); }} />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 8 },
  sparkles: { position: 'absolute', top: 6, right: -6, gap: 6, alignItems: 'center' },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  num: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});
