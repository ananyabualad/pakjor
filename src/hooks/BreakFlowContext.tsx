import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { currentRouteName, goToMain, navigationRef, resetTo } from '../navigation/navigationRef';
import { AlarmCapabilities, alarmService } from '../services/alarmService';
import {
  ACTION_SNOOZE,
  ACTION_START_BREAK,
  NOTIF_TYPE,
  notificationService,
  PermissionState,
} from '../services/notificationService';
import { soundService } from '../services/soundService';
import { statsService } from '../services/statsService';
import { timerService } from '../services/timerService';
import { STORAGE_KEYS, StorageError, storageService } from '../storage/storageService';
import { ActiveFlow, AppSettings, BreakSession, ScreenTimeSession } from '../types';
import { createId } from '../utils/id';

type PendingAction = 'open-alarm' | 'start' | 'snooze' | 'break-complete';

const DEFAULT_SETTINGS: AppSettings = { onboarded: false, soundMuted: false, dailyBreakGoal: 4 };
const EMPTY_FLOW: ActiveFlow = { session: null, alarm: null, breakSession: null };

const ACTIVE_STATUSES: ScreenTimeSession['status'][] = ['running', 'snoozed', 'ringing'];

export interface BreakFlowContextValue {
  ready: boolean;
  loadError: string | null;
  retryLoad: () => void;
  flow: ActiveFlow;
  /** session ที่ยังไม่จบ (running / snoozed / ringing) */
  activeSession: ScreenTimeSession | null;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  permission: PermissionState;
  refreshPermission: () => Promise<PermissionState>;
  requestPermission: () => Promise<PermissionState>;
  capabilities: AlarmCapabilities;
  lastCompletedBreak: BreakSession | null;
  actionError: string | null;
  clearActionError: () => void;
  startSession: (durationSec: number) => Promise<void>;
  cancelSession: () => Promise<void>;
  snooze: () => Promise<void>;
  startBreakFlow: () => Promise<void>;
  beginBreak: (durationSec: number) => Promise<void>;
  finishBreak: (early: boolean) => Promise<void>;
  onNavigationReady: () => void;
}

const BreakFlowContext = createContext<BreakFlowContextValue | null>(null);

export function BreakFlowProvider({ children }: { children: ReactNode }) {
  const [flow, setFlow] = useState<ActiveFlow>(EMPTY_FLOW);
  const flowRef = useRef<ActiveFlow>(EMPTY_FLOW);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const settingsRef = useRef(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const navReadyRef = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [capabilities, setCapabilities] = useState<AlarmCapabilities>(() =>
    alarmService.getCapabilities(),
  );
  const [lastCompletedBreak, setLastCompletedBreak] = useState<BreakSession | null>(null);
  const pending = useRef<PendingAction[]>([]);
  const busy = useRef(false);
  /** >0 ระหว่างที่ผู้ใช้กำลังทำ action (กัน evaluate() แทรกกลางทาง) */
  const actionDepth = useRef(0);
  const runAction = useCallback(async (fn: () => Promise<void>) => {
    actionDepth.current += 1;
    try {
      await fn();
    } finally {
      actionDepth.current -= 1;
    }
  }, []);
  const handledResponses = useRef(new Set<string>());
  /** key ของรอบปลุกที่แอปรับช่วงแสดงผล/เล่นเสียงแล้ว (reset เมื่อแอปไป background) */
  const ringingHandledFor = useRef<string | null>(null);

  /* ---------------- persistence ---------------- */

  const commit = useCallback(async (next: ActiveFlow) => {
    flowRef.current = next;
    setFlow(next);
    try {
      await storageService.set(STORAGE_KEYS.activeFlow, next);
    } catch (e) {
      setActionError(e instanceof StorageError ? e.message : 'บันทึกสถานะไม่สำเร็จ');
    }
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      await notificationService.configure();
      const [storedFlow, storedSettings] = await Promise.all([
        storageService.get<ActiveFlow>(STORAGE_KEYS.activeFlow, EMPTY_FLOW),
        storageService.get<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
      ]);
      const f = { ...EMPTY_FLOW, ...storedFlow };
      flowRef.current = f;
      setFlow(f);
      const s = { ...DEFAULT_SETTINGS, ...storedSettings };
      settingsRef.current = s;
      setSettings(s);
      soundService.setMuted(s.soundMuted);
      setPermission(await notificationService.getPermissionStatus());
      setCapabilities(alarmService.getCapabilities());
      readyRef.current = true;
      setReady(true);
    } catch (e) {
      setLoadError(e instanceof StorageError ? e.message : 'โหลดข้อมูลไม่สำเร็จ');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    if (patch.soundMuted !== undefined) soundService.setMuted(patch.soundMuted);
    try {
      await storageService.set(STORAGE_KEYS.settings, next);
    } catch (e) {
      setActionError(e instanceof StorageError ? e.message : 'บันทึกการตั้งค่าไม่สำเร็จ');
    }
  }, []);

  /* ---------------- permission ---------------- */

  const refreshPermission = useCallback(async () => {
    const p = await notificationService.getPermissionStatus();
    setPermission(p);
    setCapabilities(alarmService.getCapabilities());
    return p;
  }, []);

  const requestPermission = useCallback(async () => {
    const p = await notificationService.requestPermission();
    setPermission(p);
    return p;
  }, []);

  /* ---------------- flow actions ---------------- */

  const startSession = useCallback(
    async (durationSec: number) =>
      runAction(async () => {
      setActionError(null);
      const prev = flowRef.current;
      if (prev.alarm) await alarmService.cancel(prev.alarm);
      const session = timerService.createSession(durationSec);
      const alarm = await alarmService.schedule(session);
      await commit({ session, alarm, breakSession: null });
      try {
        await statsService.recordScreenSession(session);
      } catch {
        // สถิติบันทึกไม่ได้ไม่ควรขัดขวาง timer
      }
      resetTo('Timer');
      }),
    [commit, runAction],
  );

  const cancelSession = useCallback(async () =>
      runAction(async () => {
    const f = flowRef.current;
    soundService.stopAlarm();
    await alarmService.cancel(f.alarm);
    if (f.session) {
      const session: ScreenTimeSession = { ...f.session, status: 'cancelled', stoppedAt: Date.now() };
      try {
        await statsService.recordScreenSession(session);
      } catch {
        // ignore
      }
    }
    await commit(EMPTY_FLOW);
    goToMain('ScreenBreak');
    }),
  [commit, runAction]);

  const snooze = useCallback(async () =>
      runAction(async () => {
    const f = flowRef.current;
    soundService.stopAlarm();
    if (!f.session || !f.alarm || !ACTIVE_STATUSES.includes(f.session.status)) {
      goToMain('ScreenBreak');
      return;
    }
    const alarm = await alarmService.snooze(f.alarm);
    const session: ScreenTimeSession = { ...f.session, status: 'snoozed' };
    await commit({ ...f, session, alarm });
    try {
      await statsService.recordScreenSession(session);
    } catch {
      // ignore
    }
    soundService.stopAlarm();
    resetTo('Timer');
    }),
  [commit, runAction]);

  const startBreakFlow = useCallback(async () =>
      runAction(async () => {
    const f = flowRef.current;
    soundService.stopAlarm();
    await alarmService.cancel(f.alarm);
    if (f.session && ACTIVE_STATUSES.includes(f.session.status)) {
      const session: ScreenTimeSession = {
        ...f.session,
        status: 'completed',
        completed: true,
        stoppedAt: Date.now(),
      };
      await commit({
        session,
        alarm: f.alarm ? { ...f.alarm, status: 'dismissed' } : null,
        breakSession: null,
      });
      try {
        await statsService.recordScreenSession(session);
      } catch {
        // ignore
      }
    }
    soundService.stopAlarm();
    resetTo('Activity', { mode: 'flow' });
    }),
  [commit, runAction]);

  const beginBreak = useCallback(
    async (durationSec: number) => {
      const f = flowRef.current;
      const now = Date.now();
      const id = createId('break');
      let notificationId: string | null = null;
      if ((await notificationService.getPermissionStatus()) === 'granted') {
        try {
          notificationId = await notificationService.scheduleBreakComplete(now + durationSec * 1000, id);
        } catch {
          // ignore
        }
      }
      const breakSession: BreakSession = {
        id,
        screenSessionId: f.session?.id ?? null,
        startTime: now,
        endTime: now + durationSec * 1000,
        plannedDuration: durationSec,
        actualDuration: 0,
        status: 'running',
        completedAt: null,
        notificationId,
      };
      await commit({ ...f, breakSession });
      try {
        await statsService.recordBreak(breakSession);
      } catch {
        // ignore
      }
      soundService.playEffect('soft');
    },
    [commit],
  );

  const finishBreak = useCallback(
    async (early: boolean) =>
      runAction(async () => {
      const f = flowRef.current;
      const b = f.breakSession;
      if (!b) {
        resetTo('BreakComplete');
        return;
      }
      const now = Date.now();
      const end = Math.min(now, b.endTime);
      const done: BreakSession = {
        ...b,
        status: early ? 'cancelled' : 'completed',
        actualDuration: Math.max(0, Math.round((end - b.startTime) / 1000)),
        completedAt: now,
      };
      if (early) await notificationService.cancel(b.notificationId);
      await notificationService.dismissPresented(NOTIF_TYPE.breakComplete);
      try {
        await statsService.recordBreak(done);
      } catch (e) {
        setActionError(e instanceof StorageError ? e.message : 'บันทึกสถิติไม่สำเร็จ');
      }
      setLastCompletedBreak(done);
      await commit(EMPTY_FLOW);
      if (!early && AppState.currentState === 'active') soundService.playEffect('success');
      resetTo('BreakComplete');
      }),
    [commit, runAction],
  );

  /* ---------------- alarm firing (timestamp based) ---------------- */

  const triggerRinging = useCallback(async () => {
    const f = flowRef.current;
    if (!f.session || !f.alarm) return;
    const session: ScreenTimeSession = { ...f.session, status: 'ringing' };
    await commit({ ...f, session, alarm: { ...f.alarm, status: 'ringing' } });
    try {
      await statsService.recordScreenSession(session);
    } catch {
      // ignore
    }
  }, [commit]);

  const handleAction = useCallback(
    async (action: PendingAction) => {
      const f = flowRef.current;
      const active = f.session && ACTIVE_STATUSES.includes(f.session.status);
      switch (action) {
        case 'snooze':
          await snooze();
          break;
        case 'start':
          if (active) await startBreakFlow();
          else if (f.breakSession?.status === 'running') resetTo('BreakMode');
          else goToMain('ScreenBreak');
          break;
        case 'open-alarm':
          if (active && f.alarm && timerService.isExpired(f.alarm.endTime)) {
            if (f.session?.status !== 'ringing') await triggerRinging();
            if (currentRouteName() !== 'Alarm') resetTo('Alarm');
          } else if (active) {
            resetTo('Timer');
          } else if (f.breakSession?.status === 'running') {
            resetTo('BreakMode');
          }
          break;
        case 'break-complete':
          if (f.breakSession?.status === 'running') {
            if (timerService.isExpired(f.breakSession.endTime)) await finishBreak(false);
            else resetTo('BreakMode');
          } else {
            resetTo('BreakComplete');
          }
          break;
      }
    },
    [finishBreak, snooze, startBreakFlow, triggerRinging],
  );

  const processPending = useCallback(async () => {
    if (!readyRef.current || !navReadyRef.current || busy.current) return;
    busy.current = true;
    try {
      while (pending.current.length) {
        const action = pending.current.shift()!;
        await handleAction(action);
      }
    } finally {
      busy.current = false;
    }
  }, [handleAction]);

  const evaluate = useCallback(async () => {
    if (!readyRef.current || !navReadyRef.current || busy.current || actionDepth.current > 0) return;
    if (pending.current.length) {
      await processPending();
      return;
    }
    busy.current = true;
    try {
      const f = flowRef.current;
      const now = Date.now();
      const appActive = AppState.currentState === 'active';

      // 1) Timer ครบเวลา → เปลี่ยนเป็นสถานะกำลังปลุก
      if (
        f.session &&
        f.alarm &&
        (f.session.status === 'running' || f.session.status === 'snoozed') &&
        timerService.isExpired(f.alarm.endTime, now)
      ) {
        await triggerRinging();
      }

      // 2) ถ้ากำลังปลุกและผู้ใช้อยู่ในแอป → แสดงหน้า "ถึงเวลาพักแล้ว!" + เล่นเสียงในแอป
      const cur = flowRef.current;
      if (cur.session?.status === 'ringing' && appActive) {
        if (currentRouteName() !== 'Alarm') resetTo('Alarm');
        const ringKey = `${cur.alarm?.id}:${cur.alarm?.endTime}`;
        if (ringingHandledFor.current !== ringKey) {
          ringingHandledFor.current = ringKey;
          // หยุดเสียง/notification ของระบบ แล้วใช้เสียงในแอปแทน
          await alarmService.cancel(cur.alarm);
          await soundService.playAlarm();
        }
      }

      // 3) พักหน้าจอครบเวลา
      if (cur.breakSession?.status === 'running' && timerService.isExpired(cur.breakSession.endTime, now)) {
        busy.current = false;
        await finishBreak(false);
        return;
      }
    } finally {
      busy.current = false;
    }
  }, [finishBreak, processPending, triggerRinging]);

  const onNavigationReady = useCallback(() => {
    navReadyRef.current = true;
    evaluate();
  }, [evaluate]);

  /* ---------------- listeners ---------------- */

  const enqueue = useCallback(
    (action: PendingAction) => {
      pending.current.push(action);
      processPending();
    },
    [processPending],
  );

  const enqueueResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const key = `${response.notification.request.identifier}:${response.actionIdentifier}`;
      if (handledResponses.current.has(key)) return;
      handledResponses.current.add(key);
      const type = response.notification.request.content.data?.type;
      if (type === NOTIF_TYPE.breakAlarm) {
        if (response.actionIdentifier === ACTION_SNOOZE) enqueue('snooze');
        else if (response.actionIdentifier === ACTION_START_BREAK) enqueue('start');
        else enqueue('open-alarm');
      } else if (type === NOTIF_TYPE.breakComplete) {
        enqueue('break-complete');
      }
      try {
        Notifications.clearLastNotificationResponse();
      } catch {
        // ignore
      }
    },
    [enqueue],
  );

  /** Deep link จาก Android Full-Screen Intent: pakjor://alarm?action=start|snooze */
  const enqueueUrl = useCallback(
    (url: string) => {
      const parsed = Linking.parse(url);
      const host = parsed.hostname ?? parsed.path;
      if (host !== 'alarm') return;
      const action = parsed.queryParams?.action;
      if (action === 'snooze') enqueue('snooze');
      else if (action === 'start') enqueue('start');
      else enqueue('open-alarm');
    },
    [enqueue],
  );

  useEffect(() => {
    const responseSub = Notifications.addNotificationResponseReceivedListener(enqueueResponse);
    try {
      const last = Notifications.getLastNotificationResponse();
      if (last) enqueueResponse(last);
    } catch {
      // ignore
    }
    const linkSub = Linking.addEventListener('url', ({ url }) => enqueueUrl(url));
    Linking.getInitialURL()
      .then((url) => {
        if (url) enqueueUrl(url);
      })
      .catch(() => undefined);
    return () => {
      responseSub.remove();
      linkSub.remove();
    };
  }, [enqueueResponse, enqueueUrl]);

  useEffect(() => {
    if (!ready) return;
    processPending();
    const interval = setInterval(evaluate, 1000);
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshPermission();
        evaluate();
      } else {
        // ออกจากแอป: เสียงปลุกในแอปจะหยุด ปล่อยให้ OS notification ทำหน้าที่แทน
        soundService.stopAlarm();
        ringingHandledFor.current = null;
      }
    });
    return () => {
      clearInterval(interval);
      appSub.remove();
    };
  }, [ready, evaluate, processPending, refreshPermission]);

  const activeSession =
    flow.session && ACTIVE_STATUSES.includes(flow.session.status) ? flow.session : null;

  const value = useMemo<BreakFlowContextValue>(
    () => ({
      ready,
      loadError,
      retryLoad: load,
      flow,
      activeSession,
      settings,
      updateSettings,
      permission,
      refreshPermission,
      requestPermission,
      capabilities,
      lastCompletedBreak,
      actionError,
      clearActionError: () => setActionError(null),
      startSession,
      cancelSession,
      snooze,
      startBreakFlow,
      beginBreak,
      finishBreak,
      onNavigationReady,
    }),
    [
      ready, loadError, load, flow, activeSession, settings, updateSettings, permission,
      refreshPermission, requestPermission, capabilities, lastCompletedBreak, actionError,
      startSession, cancelSession, snooze, startBreakFlow, beginBreak, finishBreak, onNavigationReady,
    ],
  );

  return <BreakFlowContext.Provider value={value}>{children}</BreakFlowContext.Provider>;
}

export function useBreakFlow(): BreakFlowContextValue {
  const ctx = useContext(BreakFlowContext);
  if (!ctx) throw new Error('useBreakFlow must be used inside BreakFlowProvider');
  return ctx;
}

export { navigationRef };
