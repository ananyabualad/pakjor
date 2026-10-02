import { ExercisePlan, Weekday } from '../types';
import { addDays, startOfDay, toDateKey } from '../utils/time';
import { notificationService } from './notificationService';

export const EXERCISE_TYPES = ['เดิน', 'วิ่ง', 'ปั่นจักรยาน', 'ว่ายน้ำ', 'โยคะ', 'เต้นแอโรบิก', 'เวทเทรนนิ่ง'];

/** วันที่อยู่ในแผนในสัปดาห์นี้ (อาทิตย์–เสาร์) */
export function weekDates(now = new Date()) {
  const sunday = addDays(new Date(startOfDay(now)), -now.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
}

export function weekProgress(plan: ExercisePlan, now = new Date()) {
  const dates = weekDates(now).filter((d) => plan.days.includes(d.getDay() as Weekday));
  const keys = dates.map(toDateKey);
  const done = keys.filter((k) => plan.completions.includes(k)).length;
  return { done, total: keys.length, keys };
}

async function applyReminders(plan: ExercisePlan): Promise<ExercisePlan> {
  await notificationService.cancelMany(plan.reminderIds);
  const ids: string[] = [];
  if ((await notificationService.getPermissionStatus()) === 'granted') {
    const [h, m] = plan.time.split(':').map(Number);
    for (const day of plan.days) {
      ids.push(
        await notificationService.scheduleWeekly(
          `ถึงเวลา${plan.type}แล้ว 🏃`,
          `${plan.type} ${plan.durationMin} นาที — ${plan.goal || 'ขยับร่างกายให้แข็งแรง'}`,
          day,
          h,
          m,
          'exercise-reminder',
        ),
      );
    }
  }
  return { ...plan, reminderIds: ids };
}

async function cancelReminders(plan: ExercisePlan) {
  await notificationService.cancelMany(plan.reminderIds);
}

export const exerciseService = { applyReminders, cancelReminders };
