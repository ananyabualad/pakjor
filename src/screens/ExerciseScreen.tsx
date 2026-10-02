import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { FormField } from '../components/FormField';
import { PickerField } from '../components/PickerField';
import { ProgressCircle } from '../components/ProgressCircle';
import { Screen, ScreenHeader, SectionTitle } from '../components/Screen';
import { EmptyState, ErrorState, InlineNotice, LoadingState } from '../components/States';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { useStoredValue } from '../hooks/useStoredValue';
import { EXERCISE_TYPES, exerciseService, weekProgress } from '../services/exerciseService';
import { STORAGE_KEYS } from '../storage/keys';
import { ExercisePlan, Weekday } from '../types';
import { createId } from '../utils/id';
import { colors } from '../utils/theme';
import { formatClock, hhmmToDate, THAI_DAYS_SHORT, toDateKey } from '../utils/time';

interface Draft {
  id: string | null;
  goal: string;
  type: string;
  days: Weekday[];
  time: string;
  duration: string;
}

const emptyDraft = (): Draft => ({ id: null, goal: '', type: 'เดิน', days: [1, 3, 5], time: '18:00', duration: '30' });

export function ExerciseScreen() {
  const { permission } = useBreakFlow();
  const plans = useStoredValue<ExercisePlan[]>(STORAGE_KEYS.exercisePlans, []);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const todayKey = toDateKey(new Date());
  const todayDow = new Date().getDay() as Weekday;

  const toggleDay = (d: Weekday) =>
    draft &&
    setDraft({ ...draft, days: draft.days.includes(d) ? draft.days.filter((x) => x !== d) : [...draft.days, d].sort() as Weekday[] });

  const save = async () => {
    if (!draft) return;
    const duration = Number(draft.duration);
    if (!draft.type.trim()) return setError('กรุณาระบุประเภทกิจกรรม');
    if (!draft.days.length) return setError('เลือกอย่างน้อย 1 วัน');
    if (!(duration >= 5 && duration <= 300)) return setError('ระยะเวลา 5–300 นาที');
    setError(null);
    setSaving(true);
    try {
      const old = plans.data.find((p) => p.id === draft.id);
      let plan: ExercisePlan = {
        id: draft.id ?? createId('ex'),
        goal: draft.goal.trim(),
        type: draft.type.trim(),
        days: draft.days,
        time: draft.time,
        durationMin: duration,
        completions: old?.completions ?? [],
        reminderIds: old?.reminderIds ?? [],
        createdAt: old?.createdAt ?? Date.now(),
      };
      plan = await exerciseService.applyReminders(plan);
      if (await plans.save([...plans.data.filter((p) => p.id !== plan.id), plan])) setDraft(null);
    } catch {
      setError('บันทึกแผนไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const toggleDone = (p: ExercisePlan, key: string) => {
    const completions = p.completions.includes(key) ? p.completions.filter((k) => k !== key) : [...p.completions, key];
    plans.save(plans.data.map((x) => (x.id === p.id ? { ...x, completions } : x)));
  };

  const remove = (p: ExercisePlan) =>
    Alert.alert('ลบแผน', `ลบแผน${p.type}ใช่ไหม`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: async () => {
          await exerciseService.cancelReminders(p);
          plans.save(plans.data.filter((x) => x.id !== p.id));
        },
      },
    ]);

  if (plans.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        back
        title="กิจกรรมทางกาย"
        subtitle="ผู้ใหญ่ควรมีกิจกรรมระดับปานกลาง 150 นาที/สัปดาห์"
      />
      {plans.error ? <ErrorState message={plans.error} onRetry={plans.reload} /> : null}
      {permission !== 'granted' ? (
        <InlineNotice tone="warning" title="การแจ้งเตือนถูกปิดอยู่" message="แผนจะบันทึกได้ แต่จะไม่มีการเตือนตามวันและเวลา" />
      ) : null}

      {draft ? (
        <Card style={{ gap: 12 }}>
          <AppText variant="subheading">{draft.id ? 'แก้ไขแผน' : 'สร้างแผนใหม่'}</AppText>
          <FormField label="เป้าหมาย" value={draft.goal} onChangeText={(goal) => setDraft({ ...draft, goal })} placeholder="เช่น หัวใจแข็งแรง ลดเวลานั่ง" />
          <AppText variant="label" color={colors.textSoft}>
            ประเภทกิจกรรม
          </AppText>
          <View style={styles.wrap}>
            {EXERCISE_TYPES.map((t) => (
              <Chip key={t} label={t} selected={draft.type === t} onPress={() => setDraft({ ...draft, type: t })} color={colors.softBlueDeep} />
            ))}
          </View>
          <AppText variant="label" color={colors.textSoft}>
            วัน
          </AppText>
          <View style={styles.days}>
            {THAI_DAYS_SHORT.map((label, i) => (
              <Chip key={label} label={label} selected={draft.days.includes(i as Weekday)} onPress={() => toggleDay(i as Weekday)} />
            ))}
          </View>
          <View style={styles.row}>
            <PickerField label="เวลา" mode="time" value={hhmmToDate(draft.time)} display={draft.time} onChange={(d) => setDraft({ ...draft, time: formatClock(d) })} />
            <View style={{ flex: 1 }}>
              <FormField label="ระยะเวลา" suffix="นาที" keyboardType="number-pad" value={draft.duration} onChangeText={(duration) => setDraft({ ...draft, duration })} />
            </View>
          </View>
          {error ? <InlineNotice tone="danger" title={error} /> : null}
          <Button title="บันทึกแผน" icon="save-outline" loading={saving} onPress={save} />
          <Button title="ยกเลิก" variant="ghost" onPress={() => { setDraft(null); setError(null); }} />
        </Card>
      ) : (
        <Button title="สร้างแผนใหม่" icon="add" onPress={() => setDraft(emptyDraft())} />
      )}

      <SectionTitle>แผนของฉัน (สัปดาห์นี้)</SectionTitle>
      {plans.data.length === 0 ? (
        <EmptyState title="ยังไม่มีแผน" message="ลองเริ่มจาก เดิน 30 นาที จันทร์ / พุธ / ศุกร์" actionLabel="สร้างแผนตัวอย่าง" onAction={() => setDraft(emptyDraft())} />
      ) : (
        plans.data.map((p) => {
          const prog = weekProgress(p);
          return (
            <Card key={p.id} tint={colors.softBlue} style={{ gap: 12 }}>
              <View style={styles.row}>
                <ProgressCircle size={70} strokeWidth={8} progress={prog.total ? prog.done / prog.total : 0} color={colors.teal} trackColor={colors.white}>
                  <AppText variant="label" weight="bold">
                    {prog.done}/{prog.total}
                  </AppText>
                </ProgressCircle>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="subheading">
                    {p.type} {p.durationMin} นาที
                  </AppText>
                  <AppText variant="caption" color={colors.textSoft}>
                    {p.days.map((d) => THAI_DAYS_SHORT[d]).join(' / ')} · {p.time} น.
                  </AppText>
                  <AppText variant="caption" weight="semibold" color={colors.teal}>
                    ทำสำเร็จ {prog.done} / {prog.total} ครั้ง
                  </AppText>
                  {p.goal ? (
                    <AppText variant="label" color={colors.textSoft}>
                      🎯 {p.goal}
                    </AppText>
                  ) : null}
                </View>
                <View style={{ gap: 12 }}>
                  <Pressable hitSlop={8} accessibilityLabel="แก้ไขแผน" onPress={() => setDraft({ id: p.id, goal: p.goal, type: p.type, days: p.days, time: p.time, duration: String(p.durationMin) })}>
                    <Ionicons name="create-outline" size={20} color={colors.teal} />
                  </Pressable>
                  <Pressable hitSlop={8} accessibilityLabel="ลบแผน" onPress={() => remove(p)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
              <View style={styles.days}>
                {prog.keys.map((k) => {
                  const done = p.completions.includes(k);
                  const future = k > todayKey;
                  const d = new Date(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8)));
                  return (
                    <Pressable
                      key={k}
                      disabled={future}
                      onPress={() => toggleDone(p, k)}
                      style={[styles.dayBtn, done && styles.dayDone, future && { opacity: 0.4 }]}
                      accessibilityLabel={`${THAI_DAYS_SHORT[d.getDay()]} ${done ? 'ทำแล้ว' : 'ยังไม่ทำ'}`}
                    >
                      <AppText variant="label" color={done ? colors.white : colors.teal}>
                        {THAI_DAYS_SHORT[d.getDay()]} {d.getDate()}
                      </AppText>
                      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={done ? colors.white : colors.teal} />
                    </Pressable>
                  );
                })}
              </View>
              {p.days.includes(todayDow) && !p.completions.includes(todayKey) ? (
                <Button title="ทำแล้ววันนี้" size="sm" icon="checkmark" onPress={() => toggleDone(p, todayKey)} />
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.white },
  dayDone: { backgroundColor: colors.teal },
});
