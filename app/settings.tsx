import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';
import { scheduleDailyReminder } from '@/lib/notifications';
import { Card, SectionLabel } from '@/components/Card';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, updateSettings } = useAppData();

  const [reminderTime, setReminderTime] = useState('21:00');
  const [programStart, setProgramStart] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    if (data) {
      setReminderTime(data.settings.reminderTime || '21:00');
      setProgramStart(data.settings.programStart || '2026-04-14');
      setReminderEnabled(data.settings.reminderEnabled || false);
    }
  }, [data]);

  if (loading || !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const toggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    await updateSettings({ reminderEnabled: value });
    await scheduleDailyReminder(reminderTime, value);
  };

  const saveTime = async (time: string) => {
    setReminderTime(time);
    await updateSettings({ reminderTime: time });
    if (reminderEnabled) {
      await scheduleDailyReminder(time, true);
    }
  };

  const saveStart = async (date: string) => {
    setProgramStart(date);
    await updateSettings({ programStart: date });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{'<'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel>PROGRAM</SectionLabel>
        <Card delay={0}>
          <Text style={styles.label}>START DATE (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={programStart}
            onChangeText={saveStart}
            placeholder="2026-04-14"
            placeholderTextColor={COLORS.textMuted}
          />
          <Text style={styles.hint}>
            The first day of your 32-week program. Week number is calculated from here.
          </Text>
        </Card>

        <SectionLabel>REMINDERS</SectionLabel>
        <Card delay={50}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Daily Reminder</Text>
              <Text style={styles.rowSub}>Push notification to log your day</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={reminderEnabled ? '#fff' : COLORS.textMuted}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>TIME (HH:MM, 24H)</Text>
            <TextInput
              style={styles.input}
              value={reminderTime}
              onChangeText={saveTime}
              placeholder="21:00"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </Card>

        <SectionLabel>ABOUT</SectionLabel>
        <Card delay={100}>
          <Text style={styles.aboutText}>THE GRIND v1.0</Text>
          <Text style={styles.aboutSub}>
            Body recomposition & strength tracker. All data stored locally on this device.
          </Text>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontFamily: mono,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 60,
  },
  backBtnText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: mono,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: mono,
    fontWeight: '900',
    letterSpacing: 2,
  },
  label: {
    fontSize: 10,
    color: COLORS.label,
    fontFamily: mono,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  hint: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: 6,
    lineHeight: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: mono,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: 2,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: mono,
    fontWeight: '700',
    letterSpacing: 1,
  },
  aboutSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: mono,
    marginTop: 4,
    lineHeight: 16,
  },
});
