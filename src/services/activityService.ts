import { ACTIVITIES } from '../data/activities';
import { Activity } from '../types';
import { toDateKey } from '../utils/time';

/** สุ่มกิจกรรม โดยหลีกเลี่ยงกิจกรรมเดิมจากรอบก่อน */
function randomActivity(excludeId?: string): Activity {
  const pool = ACTIVITIES.filter((a) => a.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** กิจกรรมแนะนำประจำวัน (คงที่ตลอดวัน) */
function activityOfTheDay(date = new Date()): Activity {
  const key = toDateKey(date);
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return ACTIVITIES[hash % ACTIVITIES.length];
}

export const activityService = { randomActivity, activityOfTheDay };
