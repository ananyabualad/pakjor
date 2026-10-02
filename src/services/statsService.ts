import { STORAGE_KEYS, storageService } from '../storage/storageService';
import { ActivityCategory, ActivitySession, BreakSession, ScreenTimeSession } from '../types';
import { addDays, startOfDay, toDateKey } from '../utils/time';
import { timerService } from './timerService';

export type StatsRange = 'daily' | 'weekly' | 'monthly';

export interface StatsSummary {
  range: StatsRange;
  from: number;
  to: number;
  breakRounds: number;
  activitiesCompleted: number;
  totalBreakSeconds: number;
  byCategory: Record<ActivityCategory, number>;
  timedPhoneSeconds: number;
  activeDays: number;
  /** กราฟ: label + จำนวนรอบพักต่อช่วง */
  series: { label: string; value: number; key: string }[];
}

const emptyCategories = (): Record<ActivityCategory, number> => ({
  stretching: 0,
  walking: 0,
  breathing: 0,
  hydration: 0,
});

async function recordActivity(session: ActivitySession) {
  await storageService.upsert(STORAGE_KEYS.activitySessions, session);
}

async function recordBreak(session: BreakSession) {
  await storageService.upsert(STORAGE_KEYS.breakSessions, session);
}

async function recordScreenSession(session: ScreenTimeSession) {
  await storageService.upsert(STORAGE_KEYS.screenSessions, session);
}

function rangeBounds(range: StatsRange, now = new Date()): { from: number; to: number } {
  const today = startOfDay(now);
  const to = today + 86400000;
  if (range === 'daily') return { from: today, to };
  if (range === 'weekly') return { from: startOfDay(addDays(now, -6)), to };
  return { from: startOfDay(addDays(now, -29)), to };
}

async function loadAll() {
  const [breaks, activities, screens] = await Promise.all([
    storageService.get<BreakSession[]>(STORAGE_KEYS.breakSessions, []),
    storageService.get<ActivitySession[]>(STORAGE_KEYS.activitySessions, []),
    storageService.get<ScreenTimeSession[]>(STORAGE_KEYS.screenSessions, []),
  ]);
  return { breaks, activities, screens };
}

async function getSummary(range: StatsRange, now = new Date()): Promise<StatsSummary> {
  const { breaks, activities, screens } = await loadAll();
  const { from, to } = rangeBounds(range, now);
  const inRange = (t: number) => t >= from && t < to;

  const rangeBreaks = breaks.filter((b) => inRange(b.startTime));
  const completedBreaks = rangeBreaks.filter((b) => b.status === 'completed');
  const rangeActs = activities.filter((a) => a.completed && inRange(a.startedAt));
  const rangeScreens = screens.filter((s) => inRange(s.startTime));

  const byCategory = emptyCategories();
  rangeActs.forEach((a) => {
    byCategory[a.category] += 1;
  });

  const days = new Set<string>();
  [...rangeBreaks.map((b) => b.startTime), ...rangeActs.map((a) => a.startedAt), ...rangeScreens.map((s) => s.startTime)]
    .forEach((t) => days.add(toDateKey(t)));

  let series: StatsSummary['series'] = [];
  if (range === 'daily') {
    // แบ่งช่วงเวลาในวัน
    const slots = [
      { label: 'เช้า', from: 5, to: 12 },
      { label: 'บ่าย', from: 12, to: 17 },
      { label: 'เย็น', from: 17, to: 21 },
      { label: 'กลางคืน', from: 21, to: 29 },
    ];
    series = slots.map((slot) => ({
      key: slot.label,
      label: slot.label,
      value: completedBreaks.filter((b) => {
        let h = new Date(b.startTime).getHours();
        if (h < 5) h += 24;
        return h >= slot.from && h < slot.to;
      }).length,
    }));
  } else {
    const n = range === 'weekly' ? 7 : 30;
    for (let i = n - 1; i >= 0; i--) {
      const d = addDays(now, -i);
      const key = toDateKey(d);
      series.push({
        key,
        label: range === 'weekly' ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][d.getDay()] : `${d.getDate()}`,
        value: completedBreaks.filter((b) => toDateKey(b.startTime) === key).length,
      });
    }
  }

  return {
    range,
    from,
    to,
    breakRounds: completedBreaks.length,
    activitiesCompleted: rangeActs.length,
    totalBreakSeconds: rangeBreaks.reduce((sum, b) => sum + (b.actualDuration || 0), 0),
    byCategory,
    timedPhoneSeconds: rangeScreens.reduce((sum, s) => sum + timerService.getUsedSeconds(s), 0),
    activeDays: days.size,
    series,
  };
}

/** สรุปวันนี้สำหรับหน้า Break Complete */
async function getToday() {
  return getSummary('daily');
}

export const statsService = {
  recordActivity,
  recordBreak,
  recordScreenSession,
  getSummary,
  getToday,
};
