import { Platform } from 'react-native';

export async function isStepTrackingAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { Pedometer } = await import('expo-sensors');
    return await Pedometer.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getTodaySteps(): Promise<number | null> {
  if (Platform.OS === 'web') return null;
  try {
    const { Pedometer } = await import('expo-sensors');
    const available = await Pedometer.isAvailableAsync();
    if (!available) return null;

    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const result = await Pedometer.getStepCountAsync(start, end);
    return result.steps;
  } catch {
    return null;
  }
}
