import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { StorageKey } from '../storage/keys';
import { StorageError, storageService } from '../storage/storageService';

export interface StoredValue<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  save: (next: T) => Promise<boolean>;
}

/** โหลดข้อมูลจาก storage ทุกครั้งที่หน้าจอได้รับ focus พร้อม loading/error state */
export function useStoredValue<T>(key: StorageKey, fallback: T): StoredValue<T> {
  const fallbackRef = useRef(fallback);
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const value = await storageService.get<T>(key, fallbackRef.current);
      setData(value);
    } catch (e) {
      setError(e instanceof StorageError ? e.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [key]);

  const save = useCallback(
    async (next: T) => {
      setData(next);
      try {
        await storageService.set(key, next);
        return true;
      } catch (e) {
        setError(e instanceof StorageError ? e.message : 'บันทึกข้อมูลไม่สำเร็จ');
        return false;
      }
    },
    [key],
  );

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { data, loading, error, reload, save };
}
