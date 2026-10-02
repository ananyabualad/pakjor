import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans-thai';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from './src/components/States';
import { BreakFlowProvider, useBreakFlow } from './src/hooks/BreakFlowContext';
import { navigationRef } from './src/navigation/navigationRef';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/utils/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.teal, text: colors.text },
};

function AppContent() {
  const { ready, loadError, retryLoad, onNavigationReady } = useBreakFlow();

  useEffect(() => {
    if (ready || loadError) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready, loadError]);

  if (loadError) {
    return (
      <View style={styles.center}>
        <ErrorState message={loadError} onRetry={retryLoad} />
      </View>
    );
  }
  if (!ready) {
    return (
      <View style={styles.center}>
        <LoadingState message="กำลังเตรียมแอป..." />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={theme} onReady={onNavigationReady}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSansThai_400Regular,
    NotoSansThai_500Medium,
    NotoSansThai_600SemiBold,
    NotoSansThai_700Bold,
  });

  useEffect(() => {
    if (fontError) console.warn('[App] font load failed, using system font', fontError);
  }, [fontError]);

  // ถ้าโหลดฟอนต์ไม่สำเร็จ ยังให้ใช้งานต่อด้วยฟอนต์ระบบ
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <BreakFlowProvider>
        <AppContent />
      </BreakFlowProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
});
