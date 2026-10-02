import { SleepPlan, User } from '../types';

export const DEFAULT_USER: User = {
  name: '',
  age: null,
  sex: 'unspecified',
  heightCm: null,
  weightKg: null,
  goal: 'screen',
  dailyScreenLimitMin: 60,
  updatedAt: new Date(0).toISOString(),
};

export const DEFAULT_SLEEP_PLAN: SleepPlan = {
  bedtime: '22:30',
  wakeTime: '06:30',
  reminderOffsets: [30],
  reminderIds: [],
};
