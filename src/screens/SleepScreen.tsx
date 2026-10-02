import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { BarChart } from '../components/BarChart';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Cloud } from '../components/Decorations';
import { MonthCalendar } from '../components/MonthCalendar';
import { PickerField } from '../components/PickerField';
import { Screen, ScreenHeader, SectionTitle } from '../components/Screen';
import { ErrorState, InlineNotice, LoadingState } from '../components/States';
import { DEFAULT_SLEEP_PLAN } from '../data/defaults';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { useStoredValue } from '../hooks/useStoredValue';
import {
  prepTimes,
  SLEEP_REMINDER_OPTIONS,
  sleepHours,
  sleepService,
  sleepStatus,
} from '../services/sleepService';
import { STORAGE_KEYS } from '../storage/keys';
import { SleepPlan, SleepRecord, SleepStatus } from '../types';
import { createId } from '../utils/id';
import { colors } from '../utils/theme';
import { formatClock, formatThaiDate, fromDateKey, hhmmToDate, startOfDay, toDateKey } from '../utils/time';

const STATUS_COLOR: Record<SleepStatus, string> = {
  onPlan: colors.mintDeep,
  late: colors.peachDeep,
  notRecorded: colors.border,
};
const STATUS_LABEL: Record<SleepStatus, string> = {
  onPlan: 'เข้านอนตามแผน',
  late: 'เข้านอนช้ากว่าแผน',
  notRecorded: 'ไม่ได้บันทึก',
};

export function SleepScreen() {
  const { permission } = useBreakFlow();
  const plan = useStoredValue<SleepPlan>(STORAGE_KEYS.sleepPlan, DEFAULT_SLEEP_PLAN);
  const records = useStoredValue<SleepRecord[]>(STORAGE_KEYS.sleepRecords, []);

  const [draft, setDraft] = useState<SleepPlan | null>(null);
  const editing = draft ?? plan.data;
  const [savingPlan, setSavingPlan] = useState(false);
  const [planMsg, setPlanMsg] = useState<string | null>(null);

  const [logDate, setLogDate] = useState(toDateKey(new Date()));
  const [actualBed, setActualBed] = useState<string | null>(null);
  const [wake, setWake] = useState<string | null>(null);
  const [logMsg, setLogMsg] = useState<string | null>(null);

  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const prep = prepTimes(editing);
  const existing = records.data.find((r) => r.date === logDate);

  const dayColors = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    const first = new Date(ym.y, ym.m, 1);
    const days = new Date(ym.y, ym.m + 1, 0).getDate();
    const todayStart = startOfDay(new Date());
    for (let d = 0; d < days; d++) {
      const date = new Date(first.getFullYear(), first.getMonth(), d + 1);
      if (date.getTime() > todayStart) break;
      const key = toDateKey(date);
      const r = records.data.find((x) => x.date === key);
      map[key] = STATUS_COLOR[r?.status ?? 'notRecorded'];
    }
    return map;
  }, [records.data, ym]);

  const monthStats = useMemo(() => {
    const prefix = `${ym.y}-${String(ym.m + 1).padStart(2, '0')}`;
    const inMonth = records.data.filter((r) => r.date.startsWith(prefix));
    return {
      onPlan: inMonth.filter((r) => r.status === 'onPlan').length,
      late: inMonth.filter((r) => r.status === 'late').length,
    };
  }, [records.data, ym]);

  const trend = useMemo(() => sleepService.trend(records.data), [records.data]);

  const toggleOffset = (o: number) => {
    const set = new Set(editing.reminderOffsets);
    if (set.has(o)) set.delete(o);
    else set.add(o);
    setDraft({ ...editing, reminderOffsets: [...set].sort((a, b) => a - b) });
  };

  const savePlan = async () => {
    setSavingPlan(true);
    setPlanMsg(null);
    try {
      const next = await sleepService.applyReminders(editing);
      if (await plan.save(next)) {
        setDraft(null);
        setPlanMsg(
          permission === 'granted'
            ? `บันทึกแผนแล้ว ตั้งเตือน ${next.reminderIds.length} รายการ`
            : 'บันทึกแผนแล้ว (ยังไม่ได้อนุญาตการแจ้งเตือน จึงไม่ได้ตั้งเตือน)',
        );
      }
    } catch {
      setPlanMsg('ตั้งการแจ้งเตือนไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setSavingPlan(false);
    }
  };

  const saveLog = async () => {
    const bed = actualBed ?? existing?.actualBedtime ?? null;
    if (!bed) {
      setLogMsg('กรุณาเลือกเวลาเข้านอนจริง');
      return;
    }
    const record: SleepRecord = {
      id: existing?.id ?? createId('sleep'),
      date: logDate,
      plannedBedtime: plan.data.bedtime,
      actualBedtime: bed,
      wakeTime: wake ?? existing?.wakeTime ?? null,
      status: sleepStatus(plan.data.bedtime, bed),
    };
    const list = [...records.data.filter((r) => r.date !== logDate), record];
    if (await records.save(list)) {
      setLogMsg(`บันทึกแล้ว: ${STATUS_LABEL[record.status]}`);
      setActualBed(null);
      setWake(null);
    }
  };

  if (plan.loading || records.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  const shownBed = actualBed ?? existing?.actualBedtime ?? null;
  const shownWake = wake ?? existing?.wakeTime ?? null;

  return (
    <Screen>
      <ScreenHeader title="การนอน" subtitle="วางแผนและบันทึกการนอนของคุณ" />
      {plan.error || records.error ? (
        <ErrorState message={(plan.error || records.error)!} onRetry={() => { plan.reload(); records.reload(); }} />
      ) : null}

      <Card tint={colors.lavender} style={{ gap: 12 }}>
        <View style={styles.row}>
          <Ionicons name="moon" size={20} color={colors.lavenderDeep} />
          <AppText variant="subheading" style={{ flex: 1 }}>
            แผนการนอน
          </AppText>
          <Cloud width={54} />
        </View>
        <View style={styles.row}>
          <PickerField
            label="เวลาเข้านอน"
            mode="time"
            value={hhmmToDate(editing.bedtime)}
            display={editing.bedtime}
            onChange={(d) => setDraft({ ...editing, bedtime: formatClock(d) })}
          />
          <PickerField
            label="เวลาตื่น"
            mode="time"
            value={hhmmToDate(editing.wakeTime)}
            display={editing.wakeTime}
            onChange={(d) => setDraft({ ...editing, wakeTime: formatClock(d) })}
          />
        </View>
        <View style={styles.tip}>
          <AppText variant="caption">
            ⏰ นอนประมาณ <AppText variant="caption" weight="bold">{prep.hours} ชั่วโมง</AppText>
            {prep.hours < 7 ? ' (ผู้ใหญ่ควรนอน 7–9 ชั่วโมง)' : ''}
          </AppText>
          <AppText variant="caption">📵 วางโทรศัพท์ตั้งแต่ {prep.screenOff} น.</AppText>
          <AppText variant="caption">🛁 เริ่มเตรียมตัวนอน (อาบน้ำ หรี่ไฟ) {prep.windDown} น.</AppText>
        </View>
        <AppText variant="label" color={colors.textSoft}>
          เตือนก่อนเวลาเข้านอน
        </AppText>
        <View style={styles.chips}>
          {SLEEP_REMINDER_OPTIONS.map((o) => (
            <Chip
              key={o}
              label={o === 60 ? '+1 ชั่วโมง' : `+${o} นาที`}
              selected={editing.reminderOffsets.includes(o)}
              onPress={() => toggleOffset(o)}
              color={colors.lavenderDeep}
            />
          ))}
        </View>
        {permission !== 'granted' ? (
          <InlineNotice tone="warning" title="การแจ้งเตือนถูกปิดอยู่" message="กรุณาเปิดการแจ้งเตือนในการตั้งค่าโทรศัพท์ เพื่อรับการเตือนก่อนนอน" />
        ) : null}
        {planMsg ? <InlineNotice tone="success" title={planMsg} /> : null}
        <Button title="บันทึกแผนการนอน" icon="save-outline" loading={savingPlan} onPress={savePlan} />
      </Card>

      <SectionTitle>บันทึกเวลานอนจริง</SectionTitle>
      <Card style={{ gap: 12 }}>
        <PickerField
          label="คืนวันที่"
          mode="date"
          value={fromDateKey(logDate)}
          display={formatThaiDate(logDate)}
          maximumDate={new Date()}
          onChange={(d) => {
            setLogDate(toDateKey(d));
            setActualBed(null);
            setWake(null);
          }}
        />
        <View style={styles.row}>
          <PickerField
            label="เข้านอนจริง"
            mode="time"
            value={shownBed ? hhmmToDate(shownBed) : hhmmToDate(plan.data.bedtime)}
            display={shownBed ?? undefined}
            placeholder="เลือกเวลา"
            onChange={(d) => setActualBed(formatClock(d))}
          />
          <PickerField
            label="ตื่นจริง"
            mode="time"
            value={shownWake ? hhmmToDate(shownWake) : hhmmToDate(plan.data.wakeTime)}
            display={shownWake ?? undefined}
            placeholder="เลือกเวลา"
            onChange={(d) => setWake(formatClock(d))}
          />
        </View>
        {shownBed && shownWake ? (
          <AppText variant="caption" color={colors.textSoft}>
            นอนประมาณ {sleepHours(shownBed, shownWake)} ชั่วโมง
          </AppText>
        ) : null}
        {logMsg ? <InlineNotice tone="info" title={logMsg} /> : null}
        <Button title={existing ? 'แก้ไขบันทึก' : 'บันทึกการนอน'} icon="checkmark" onPress={saveLog} />
      </Card>

      <SectionTitle>ภาพรวมรายเดือน</SectionTitle>
      <Card style={{ gap: 10 }}>
        <MonthCalendar
          year={ym.y}
          month={ym.m}
          onChangeMonth={(y, m) => setYm({ y, m })}
          dayColors={dayColors}
          onPressDay={(key) => {
            if (key <= toDateKey(new Date())) {
              setLogDate(key);
              setActualBed(null);
              setWake(null);
              setLogMsg(null);
            }
          }}
          legend={(['onPlan', 'late', 'notRecorded'] as SleepStatus[]).map((s) => ({ label: STATUS_LABEL[s], color: STATUS_COLOR[s] }))}
        />
        <AppText variant="caption" color={colors.textSoft}>
          เดือนนี้เข้านอนตามแผน {monthStats.onPlan} คืน · ช้ากว่าแผน {monthStats.late} คืน
        </AppText>
      </Card>

      <SectionTitle>แนวโน้มชั่วโมงการนอน (14 วัน)</SectionTitle>
      <Card>
        {trend.every((t) => t.value === 0) ? (
          <AppText variant="caption" color={colors.textSoft} center>
            ยังไม่มีข้อมูล บันทึกทั้งเวลาเข้านอนและเวลาตื่นเพื่อดูกราฟ
          </AppText>
        ) : (
          <BarChart data={trend} color={colors.lavenderDeep} labelEvery={2} maxValue={10} />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tip: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 12, gap: 4 },
});
