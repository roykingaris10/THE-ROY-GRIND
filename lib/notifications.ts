import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return true;
}

export async function scheduleDailyReminder(time: string, enabled: boolean): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;
  const granted = await requestPermissions();
  if (!granted) return;
  const [hours, minutes] = time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ROYFORGE',
      body: 'Log your day — weight, macros, recovery',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}
