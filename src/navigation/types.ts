import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  ScreenBreak: undefined;
  Sleep: undefined;
  Health: undefined;
  Stats: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  SetScreenTime: undefined;
  Timer: undefined;
  Alarm: undefined;
  Activity: { mode: 'flow' | 'standalone'; activityId?: string };
  BreakMode: undefined;
  BreakComplete: undefined;
  Menstrual: undefined;
  SexualHealth: undefined;
  BMI: undefined;
  Exercise: undefined;
  Profile: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
