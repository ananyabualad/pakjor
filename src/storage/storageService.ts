import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, StorageKey } from './keys';

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly key: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/** อ่านค่า JSON จาก AsyncStorage — ถ้าไม่มีข้อมูลคืน fallback, ถ้าอ่านไม่ได้ throw StorageError */
async function get<T>(key: StorageKey, fallback: T): Promise<T> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(key);
  } catch (e) {
    throw new StorageError('ไม่สามารถอ่านข้อมูลจากเครื่องได้', key, e);
  }
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    throw new StorageError('ข้อมูลที่บันทึกไว้เสียหาย', key, e);
  }
}

async function set<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    throw new StorageError('ไม่สามารถบันทึกข้อมูลลงเครื่องได้', key, e);
  }
}

async function remove(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    throw new StorageError('ไม่สามารถลบข้อมูลได้', key, e);
  }
}

/** อ่าน-แก้ไข-บันทึก list แบบเรียงลำดับ (กัน race condition ภายในแอป) */
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => undefined);
  return next;
}

async function updateList<T>(key: StorageKey, updater: (list: T[]) => T[]): Promise<T[]> {
  return serialize(async () => {
    const list = await get<T[]>(key, []);
    const next = updater(list);
    await set(key, next);
    return next;
  });
}

async function upsert<T extends { id: string }>(key: StorageKey, item: T): Promise<T[]> {
  return updateList<T>(key, (list) => {
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx === -1) return [...list, item];
    const copy = [...list];
    copy[idx] = item;
    return copy;
  });
}

async function removeById<T extends { id: string }>(key: StorageKey, id: string): Promise<T[]> {
  return updateList<T>(key, (list) => list.filter((x) => x.id !== id));
}

async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (e) {
    throw new StorageError('ไม่สามารถล้างข้อมูลได้', 'all', e);
  }
}

export const storageService = { get, set, remove, updateList, upsert, removeById, clearAll };
export { STORAGE_KEYS };
