import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let soundsEnabled = true;

export function setSoundsEnabled(enabled: boolean) {
  soundsEnabled = enabled;
}

async function initAudio() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch {}
}

initAudio();

export async function playTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function playPress() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export async function playSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function playPR() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 150);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 300);
}

export async function playError() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export async function playSelection() {
  Haptics.selectionAsync();
}

export async function playSessionStart() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, 200);
}

export async function playSessionEnd() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 200);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, 400);
}

export async function playStreak() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, i * 100);
  }
}
