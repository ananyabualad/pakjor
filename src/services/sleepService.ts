import { SleepPlan, SleepRecord, SleepStatus } from '../types';
import { addDays, hhmmToMinutes, minutesToHHMM, toDateKey } from '../utils/time';
import { notificationService } from './notificationService';

export const SLEEP_REMINDER_OPTIONS = [15, 30, 45, 60];
/** เข้านอนช้ากว่าแผนเกินกี่นาทีถึงนับว่า "ช้ากว่าแผน" */
export const LATE_TOLERANCE_MIN = 15;

/** ผลต่าง (นาที) ของเวลาจริงเทียบแผน โดยคิดข้ามเที่ยงคืนได้ (-12 ชม. ถึง +12 ชม.) */
export function bedtimeDiffMinutes(planned: string, actual: string): number {
  let diff = hhmmToMinutes(actual) - hhmmToMinutes(planned);
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff;
}

export function sleepStatus(planned: string, actual: string | null): SleepStatus {
  if (!actual) return 'notRecorded';
  return bedtimeDiffMinutes(planned, actual) > LATE_TOLERANCE_MIN ? 'late' : 'onPlan';
}

/** ระยะเวลานอน (ชั่วโมง) จากเวลาเข้านอนถึงเวลาตื่น */
export function sleepHours(bed: string, wake: string): number {
  let mins = hhmmToMinutes(wake) - hhmmToMinutes(bed);
  if (mins <= 0) mins += 1440;
  return Math.round((mins / 60) * 10) / 10;
}

export function prepTimes(plan: SleepPlan) {
  const bed = hhmmToMinutes(plan.bedtime);
  return {
    screenOff: minutesToHHMM(bed - 60),
    windDown: minutesToHHMM(bed - 30),
    hours: sleepHours(plan.bedtime, plan.wakeTime),
  };
}

/** ตั้ง reminder รายวันก่อนเวลาเข้านอนตาม offset ที่เลือก (ยกเลิกของเดิมก่อน) */
async function applyReminders(plan: SleepPlan): Promise<SleepPlan> {
  await notificationService.cancelMany(plan.reminderIds);
  const ids: string[] = [];
  if ((await notificationService.getPermissionStatus()) === 'granted') {
    for (const offset of plan.reminderOffsets) {
      const t = hhmmToMinutes(plan.bedtime) - offset;
      const hhmm = minutesToHHMM(t);
      const [h, m] = hhmm.split(':').map(Number);
      const label = offset === 60 ? '1 ชั่วโมง' : `${offset} นาที`;
      ids.push(
        await notificationService.scheduleDaily(
          'ใกล้เวลาเข้านอนแล้ว 🌙',
          `อีก ${label} จะถึงเวลาเข้านอน (${plan.bedtime} น.) ลองวางโทรศัพท์และเตรียมตัวพักผ่อนกัน`,
          h,
          m,
          'sleep-reminder',
        ),
      );
    }
  }
  return { ...plan, reminderIds: ids };
}

/** สร้างรายการ N วันล่าสุด พร้อมชั่วโมงการนอน (สำหรับกราฟแนวโน้ม) */
function trend(records: SleepRecord[], days = 14, now = new Date()) {
  const out: { key: string; label: string; value: number; color?: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(now, -i);
    const key = toDateKey(d);
    const r = records.find((x) => x.date === key);
    const value = r?.actualBedtime && r.wakeTime ? sleepHours(r.actualBedtime, r.wakeTime) : 0;
    out.push({ key, label: `${d.getDate()}`, value });
  }
  return out;
}

export const sleepService = { applyReminders, trend };
