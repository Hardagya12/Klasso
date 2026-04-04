import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import {
  Caveat_400Regular,
  Caveat_500Medium,
  Caveat_600SemiBold,
  Caveat_700Bold,
} from '@expo-google-fonts/caveat';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    Caveat_400Regular,
    Caveat_500Medium,
    Caveat_600SemiBold,
    Caveat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="parent/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="parent/child-overview" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="parent/notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="parent/fees" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="parent/settings" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="parent/ptm" options={{ animation: 'slide_from_right' }} />
        {/* Feature screens — deep-linkable */}
        <Stack.Screen name="sub-briefing" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="class-xp" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="mood" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="timecapsule" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="duel/index" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
