import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { FormField } from '../components/FormField';
import { MonthCalendar } from '../components/MonthCalendar';
import { PickerField } from '../components/PickerField';
import { Screen, ScreenHeader, SectionTitle } from '../components/Screen';
import { EmptyState, ErrorState, InlineNotice, LoadingState } from '../components/States';
import { StatCard } from '../components/StatCard';
import { useStoredValue } from '../hooks/useStoredValue';
import {
  averageCycle,
  educationalAlerts,
  periodDays,
  periodLength,
  predictNext,
  sortRecords,
  SYMPTOMS,
  symptomLabel,
} from '../services/menstrualService';
import { STORAGE_KEYS } from '../storage/keys';
import { MenstrualRecord, MenstrualSymptom } from '../types';
import { createId } from '../utils/id';
import { colors } from '../utils/theme';
import { formatThaiDate, fromDateKey, toDateKey } from '../utils/time';

interface Draft {
  id: string | null;
  startDate: string;
  endDate: string | null;
  symptoms: MenstrualSymptom[];
  note: string;
}

const emptyDraft = (): Draft => ({ id: null, startDate: toDateKey(new Date()), endDate: null, symptoms: [], note: '' });

export function MenstrualScreen() {
  const records = useStoredValue<MenstrualRecord[]>(STORAGE_KEYS.menstrualRecords, []);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const sorted = useMemo(() => sortRecords(records.data), [records.data]);
  const avg = averageCycle(records.data);
  const next = predictNext(records.data);
  const alerts = educationalAlerts(records.data);

  const dayColors = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    periodDays(records.data).forEach((k) => (map[k] = colors.peachDeep));
    if (next) map[next] = colors.lavender;
    return map;
  }, [records.data, next]);

  const toggle = (s: MenstrualSymptom) =>
    setDraft((d) => ({
      ...d,
      symptoms: d.symptoms.includes(s) ? d.symptoms.filter((x) => x !== s) : [...d.symptoms, s],
    }));

  const save = async () => {
    setSaved(null);
    if (draft.endDate && draft.endDate < draft.startDate) {
      setFormError('วันสุดท้ายต้องไม่ก่อนวันแรก');
      return;
    }
    if (records.data.some((r) => r.startDate === draft.startDate && r.id !== draft.id)) {
      setFormError('มีบันทึกที่เริ่มวันเดียวกันอยู่แล้ว');
      return;
    }
    setFormError(null);
    const record: MenstrualRecord = {
      id: draft.id ?? createId('mens'),
      startDate: draft.startDate,
      endDate: draft.endDate,
      symptoms: draft.symptoms,
      note: draft.note.trim(),
      createdAt: Date.now(),
    };
    const list = [...records.data.filter((r) => r.id !== record.id), record];
    if (await records.save(list)) {
      setSaved(draft.id ? 'แก้ไขบันทึกแล้ว' : 'บันทึกรอบเดือนแล้ว');
      setDraft(emptyDraft());
    }
  };

  const edit = (r: MenstrualRecord) => {
    setDraft({ id: r.id, startDate: r.startDate, endDate: r.endDate, symptoms: r.symptoms, note: r.note });
    setSaved(null);
  };

  const remove = (r: MenstrualRecord) =>
    Alert.alert('ลบบันทึก', `ลบบันทึกวันที่ ${formatThaiDate(r.startDate)} ใช่ไหม`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => records.save(records.data.filter((x) => x.id !== r.id)) },
    ]);

  if (records.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader back title="ประจำเดือน" subtitle="บันทึกรอบเดือนและสังเกตร่างกายของตัวเอง" />
      {records.error ? <ErrorState message={records.error} onRetry={records.reload} /> : null}

      <View style={styles.stats}>
        <StatCard icon="repeat-outline" label="รอบเดือนเฉลี่ย" value={avg ? `${avg} วัน` : '—'} tint={colors.peach} iconColor={colors.peachDeep} />
        <StatCard icon="calendar-outline" label="คาดว่ารอบถัดไป" value={next ? formatThaiDate(next) : '—'} tint={colors.lavender} iconColor={colors.lavenderDeep} />
      </View>
      {!avg ? (
        <AppText variant="caption" color={colors.textSoft}>
          บันทึกอย่างน้อย 2 รอบ เพื่อคำนวณระยะเวลารอบเดือนและวันที่คาดการณ์ (เป็นการประมาณเท่านั้น)
        </AppText>
      ) : null}

      {alerts.length ? (
        <InlineNotice
          tone="warning"
          icon="information-circle-outline"
          title="ข้อมูลเชิงสุขศึกษา"
          message={`${alerts.map((a) => `• ${a}`).join('\n')}\n\nรอบเดือนอาจเปลี่ยนแปลงได้จากหลายปัจจัย ข้อมูลนี้ไม่ใช่การวินิจฉัยโรค หากมีอาการต่อเนื่อง ปวดมาก หรือกังวล ควรปรึกษาแพทย์หรือบุคลากรสาธารณสุข`}
        />
      ) : null}

      <SectionTitle>{draft.id ? 'แก้ไขบันทึก' : 'บันทึกรอบใหม่'}</SectionTitle>
      <Card style={{ gap: 12 }}>
        <View style={styles.row}>
          <PickerField
            label="วันแรก"
            mode="date"
            value={fromDateKey(draft.startDate)}
            display={formatThaiDate(draft.startDate)}
            maximumDate={new Date()}
            onChange={(d) => setDraft({ ...draft, startDate: toDateKey(d) })}
          />
          <PickerField
            label="วันสุดท้าย"
            mode="date"
            value={draft.endDate ? fromDateKey(draft.endDate) : fromDateKey(draft.startDate)}
            display={draft.endDate ? formatThaiDate(draft.endDate) : undefined}
            placeholder="ยังไม่หมด"
            minimumDate={fromDateKey(draft.startDate)}
            onChange={(d) => setDraft({ ...draft, endDate: toDateKey(d) })}
          />
        </View>
        {draft.endDate ? (
          <Pressable onPress={() => setDraft({ ...draft, endDate: null })}>
            <AppText variant="label" color={colors.teal}>
              ล้างวันสุดท้าย (ยังมีประจำเดือนอยู่)
            </AppText>
          </Pressable>
        ) : null}
        <AppText variant="label" color={colors.textSoft}>
          อาการ
        </AppText>
        <View style={styles.chips}>
          {SYMPTOMS.map((s) => (
            <Chip key={s.key} label={s.label} selected={draft.symptoms.includes(s.key)} onPress={() => toggle(s.key)} color={colors.peachDeep} />
          ))}
        </View>
        <FormField
          label="บันทึกเพิ่มเติม / ความผิดปกติที่สังเกตได้"
          value={draft.note}
          onChangeText={(note) => setDraft({ ...draft, note })}
          placeholder="เช่น ปริมาณมากกว่าปกติ"
          multiline
        />
        {formError ? <InlineNotice tone="danger" title={formError} /> : null}
        {saved ? <InlineNotice tone="success" title={saved} /> : null}
        <Button title={draft.id ? 'บันทึกการแก้ไข' : 'บันทึก'} icon="save-outline" onPress={save} variant="peach" />
        {draft.id ? <Button title="ยกเลิกการแก้ไข" variant="ghost" onPress={() => setDraft(emptyDraft())} /> : null}
      </Card>

      <SectionTitle>ปฏิทิน</SectionTitle>
      <Card>
        <MonthCalendar
          year={ym.y}
          month={ym.m}
          onChangeMonth={(y, m) => setYm({ y, m })}
          dayColors={dayColors}
          legend={[
            { label: 'วันที่มีประจำเดือน', color: colors.peachDeep },
            { label: 'คาดว่ารอบถัดไป', color: colors.lavender },
          ]}
        />
      </Card>

      <SectionTitle>ประวัติ</SectionTitle>
      {sorted.length === 0 ? (
        <EmptyState title="ยังไม่มีบันทึก" message="เริ่มบันทึกวันแรกของประจำเดือนด้านบนได้เลย" />
      ) : (
        sorted.map((r) => {
          const len = periodLength(r);
          return (
            <Card key={r.id} style={{ gap: 6 }}>
              <View style={styles.row}>
                <Ionicons name="water" size={18} color={colors.peachDeep} />
                <AppText variant="subheading" style={{ flex: 1 }}>
                  {formatThaiDate(r.startDate)}
                  {r.endDate ? ` – ${formatThaiDate(r.endDate)}` : ''}
                </AppText>
                <Pressable onPress={() => edit(r)} hitSlop={8} accessibilityLabel="แก้ไข">
                  <Ionicons name="create-outline" size={20} color={colors.teal} />
                </Pressable>
                <Pressable onPress={() => remove(r)} hitSlop={8} accessibilityLabel="ลบ">
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
              <AppText variant="caption" color={colors.textSoft}>
                {len ? `มีประจำเดือน ${len} วัน` : 'ยังไม่ได้บันทึกวันสุดท้าย'}
                {r.symptoms.length ? ` · อาการ: ${r.symptoms.map(symptomLabel).join(', ')}` : ''}
              </AppText>
              {r.note ? <AppText variant="caption">📝 {r.note}</AppText> : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
