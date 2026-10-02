import { ScreenTimeSession } from '../types';
import { createId } from '../utils/id';

/**
 * Timer ที่อิง timestamp จริง (ไม่พึ่ง setInterval เป็นตัวนับเวลา)
 *
 * remaining = endTime - Date.now()
 *
 * setInterval / requestAnimationFrame ใช้แค่ "วาดหน้าจอใหม่" เท่านั้น
 * เมื่อแอปถูก background, ถูกปิด, หรือ component ถูก unmount เวลาที่เหลือ
 * ยังคำนวณได้ถูกต้องเสมอจาก endTime ที่บันทึกไว้ใน storage
 */
export const timerService = {
  createSession(durationSec: number, now: number = Date.now()): ScreenTimeSession {
    const duration = Math.max(1, Math.round(durationSec));
    return {
      id: createId('screen'),
      startTime: now,
      endTime: now + duration * 1000,
      duration,
      status: 'running',
      completed: false,
    };
  },

  getRemainingMs(endTime: number, now: number = Date.now()): number {
    return Math.max(0, endTime - now);
  },

  getRemainingSec(endTime: number, now: number = Date.now()): number {
    return Math.ceil(Math.max(0, endTime - now) / 1000);
  },

  isExpired(endTime: number, now: number = Date.now()): boolean {
    return now >= endTime;
  },

  /** 0..1 */
  getProgress(startTime: number, endTime: number, now: number = Date.now()): number {
    const total = endTime - startTime;
    if (total <= 0) return 1;
    return Math.min(1, Math.max(0, (now - startTime) / total));
  },

  /** วินาทีที่ใช้ไปจริงของ session (ใช้คำนวณเวลาใช้โทรศัพท์ตาม timer) */
  getUsedSeconds(session: ScreenTimeSession, now: number = Date.now()): number {
    const end = session.stoppedAt ?? now;
    return Math.max(0, Math.round((end - session.startTime) / 1000));
  },
};
