import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider, useAppData } from '@/hooks/useAppData';
import { COLORS } from '@/lib/constants';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootNav() {
  const { data, loading } = useAppData();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const onboarded = data?.settings?.onboardingComplete;
    const inOnboarding = segments[0] === 'onboarding';

    if (!onboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [loading, data?.settings?.onboardingComplete, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <RootNav />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
