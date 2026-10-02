import { MenstrualRecord, MenstrualSymptom } from '../types';
import { addDays, daysBetween, fromDateKey, toDateKey } from '../utils/time';

export const SYMPTOMS: { key: MenstrualSymptom; label: string }[] = [
  { key: 'cramps', label: 'ปวดท้อง' },
  { key: 'headache', label: 'ปวดศีรษะ' },
  { key: 'fatigue', label: 'อ่อนเพลีย' },
  { key: 'mood', label: 'อารมณ์เปลี่ยนแปลง' },
  { key: 'abnormalBleeding', label: 'เลือดออกผิดปกติ' },
];

export const symptomLabel = (k: MenstrualSymptom) => SYMPTOMS.find((s) => s.key === k)?.label ?? k;

export function sortRecords(records: MenstrualRecord[]) {
  return [...records].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
}

export function periodLength(r: MenstrualRecord): number | null {
  return r.endDate ? daysBetween(r.startDate, r.endDate) + 1 : null;
}

/** ระยะห่างระหว่างวันแรกของรอบติดกัน (วัน) */
export function cycleLengths(records: MenstrualRecord[]): number[] {
  const asc = [...records].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
  const out: number[] = [];
  for (let i = 1; i < asc.length; i++) out.push(daysBetween(asc[i - 1].startDate, asc[i].startDate));
  return out;
}

export function averageCycle(records: MenstrualRecord[]): number | null {
  const c = cycleLengths(records).slice(-6);
  if (!c.length) return null;
  return Math.round(c.reduce((a, b) => a + b, 0) / c.length);
}

export function predictNext(records: MenstrualRecord[]): string | null {
  const latest = sortRecords(records)[0];
  const avg = averageCycle(records);
  if (!latest || !avg) return null;
  return toDateKey(addDays(fromDateKey(latest.startDate), avg));
}

/** วันในเดือนที่มีประจำเดือน (ตามบันทึก) */
export function periodDays(records: MenstrualRecord[]): Set<string> {
  const set = new Set<string>();
  records.forEach((r) => {
    const len = periodLength(r) ?? 1;
    for (let i = 0; i < Math.min(len, 15); i++) set.add(toDateKey(addDays(fromDateKey(r.startDate), i)));
  });
  return set;
}

/**
 * ข้อมูลเชิงสุขศึกษาเมื่อพบรูปแบบที่ควรสังเกต — ไม่ใช่การวินิจฉัยโรค
 * เกณฑ์อ้างอิงทั่วไป: รอบเดือนปกติประมาณ 21–35 วัน, มีประจำเดือนประมาณ 2–7 วัน
 */
export function educationalAlerts(records: MenstrualRecord[]): string[] {
  const alerts: string[] = [];
  const cycles = cycleLengths(records).slice(-3);
  if (cycles.some((c) => c < 21))
    alerts.push('มีรอบเดือนที่ห่างกันน้อยกว่า 21 วัน ซึ่งสั้นกว่าช่วงที่พบได้ทั่วไป (ประมาณ 21–35 วัน)');
  if (cycles.some((c) => c > 35))
    alerts.push('มีรอบเดือนที่ห่างกันมากกว่า 35 วัน ซึ่งยาวกว่าช่วงที่พบได้ทั่วไป อาจเกิดจากความเครียด การพักผ่อน น้ำหนักเปลี่ยน หรือสาเหตุอื่น');
  const latest = sortRecords(records).slice(0, 3);
  if (latest.some((r) => (periodLength(r) ?? 0) > 7))
    alerts.push('มีประจำเดือนนานกว่า 7 วันในบางรอบ');
  if (latest.some((r) => r.symptoms.includes('abnormalBleeding')))
    alerts.push('มีการบันทึกว่ามีเลือดออกผิดปกติ เช่น ออกมากผิดปกติ หรือออกนอกช่วงประจำเดือน');
  if (latest.filter((r) => r.symptoms.includes('cramps')).length >= 2)
    alerts.push('มีอาการปวดท้องประจำเดือนต่อเนื่องหลายรอบ หากปวดมากจนกระทบชีวิตประจำวันควรได้รับการประเมิน');
  return alerts;
}
