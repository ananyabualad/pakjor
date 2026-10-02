import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function currentRouteName(): string | undefined {
  return navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
}

/** ล้าง stack แล้วไปหน้าที่ต้องการ (กลับปุ่ม back แล้วจะไปหน้าหลัก) */
export function resetTo<K extends keyof RootStackParamList>(
  name: K,
  params?: RootStackParamList[K],
) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [
        { name: 'Main', params: { screen: 'ScreenBreak' } },
        { name, params },
      ],
    }),
  );
}

export function goToMain(tab: 'Home' | 'ScreenBreak' | 'Sleep' | 'Health' | 'Stats' = 'Home') {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({ index: 0, routes: [{ name: 'Main', params: { screen: tab } }] }),
  );
}
