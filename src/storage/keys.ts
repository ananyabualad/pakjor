const PREFIX = '@pakjor/v1/';

export const STORAGE_KEYS = {
  settings: `${PREFIX}settings`,
  user: `${PREFIX}user`,
  activeFlow: `${PREFIX}activeFlow`,
  screenSessions: `${PREFIX}screenSessions`,
  activitySessions: `${PREFIX}activitySessions`,
  breakSessions: `${PREFIX}breakSessions`,
  sleepPlan: `${PREFIX}sleepPlan`,
  sleepRecords: `${PREFIX}sleepRecords`,
  menstrualRecords: `${PREFIX}menstrualRecords`,
  healthRecords: `${PREFIX}healthRecords`,
  exercisePlans: `${PREFIX}exercisePlans`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
