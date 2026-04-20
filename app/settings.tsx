import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Keyboard,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { useAppData } from '@/hooks/useAppData';
import { Card, SectionLabel } from '@/components/Card';
import { GradientButton } from '@/components/GradientButton';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, loading, updateSettings, updateProfile, resetAllData } = useAppData();

  const [age, setAge] = useState(String(data?.profile.age ?? 24));
  const [height, setHeight] = useState(String(data?.profile.heightCm ?? 180));
  const [sex, setSex] = useState<'male' | 'female'>(data?.profile.sex ?? 'male');
  const [programStart, setProgramStart] = useState(data?.settings.programStart ?? '2026-04-14');
  const [showStretch, setShowStretch] = useState(data?.settings.showStretchTargets ?? false);
  const [autoSteps, setAutoSteps] = useState(data?.settings.autoSyncSteps ?? false);
  const [defaultEbike, setDefaultEbike] = useState(String(data?.settings.defaultEbikeMinutesPerDay ?? 20));
  const [reminderEnabled, setReminderEnabled] = useState(data?.settings.reminderEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(data?.settings.reminderTime ?? '21:00');
  const [expandPoem, setExpandPoem] = useState(false);

  const saveProfile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateProfile({ age: parseInt(age), sex, heightCm: parseInt(height) });
    Alert.alert('Saved', 'Profile updated.');
  };

  const saveSettings = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateSettings({
      programStart,
      showStretchTargets: showStretch,
      autoSyncSteps: autoSteps,
      defaultEbikeMinutesPerDay: parseInt(defaultEbike) || 20,
      reminderEnabled,
      reminderTime,
    });
    Alert.alert('Saved', 'Settings updated.');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data?',
      'This will erase everything and restart from onboarding. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: async () => { await resetAllData(); router.replace('/onboarding'); } },
      ]
    );
  };

  if (loading || !data) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={14} color={COLORS.silver} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Profile section */}
        <SectionLabel>PROFILE</SectionLabel>
        <Card style={{ padding: 0 }}>
          <SettingsRow label="Age" right={
            <TextInput style={styles.rowInput} value={age} onChangeText={setAge}
              keyboardType="number-pad" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
          } />
          <SettingsRow label="Sex" right={
            <Text style={styles.rowValue}>{sex === 'male' ? 'Male' : 'Female'}</Text>
          } />
          <SettingsRow label="Height" right={
            <TextInput style={styles.rowInput} value={height} onChangeText={setHeight}
              keyboardType="number-pad" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
          } last />
        </Card>
        <GradientButton label="SAVE PROFILE" onPress={saveProfile} style={{ marginBottom: 18 }} />

        {/* Program section */}
        <SectionLabel>PROGRAM</SectionLabel>
        <Card style={{ padding: 0 }}>
          <SettingsRow label="Start Date" right={
            <TextInput style={styles.rowInput} value={programStart} onChangeText={setProgramStart}
              returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
          } />
          <SettingsRow label="Target" right={
            <View style={styles.miniToggle}>
              <TouchableOpacity
                onPress={() => setShowStretch(false)}
                style={[styles.miniToggleBtn, !showStretch && styles.miniToggleBtnActive]}
              >
                <Text style={[styles.miniToggleText, !showStretch && { color: COLORS.silverBright }]}>REALISTIC</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowStretch(true)}
                style={[styles.miniToggleBtn, showStretch && styles.miniToggleBtnActive]}
              >
                <Text style={[styles.miniToggleText, showStretch && { color: COLORS.silverBright }]}>STRETCH</Text>
              </TouchableOpacity>
            </View>
          } last />
        </Card>

        {/* Activity section */}
        <SectionLabel>ACTIVITY DEFAULTS</SectionLabel>
        <Card style={{ padding: 0 }}>
          <SettingsRow label="E-bike default" right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TextInput style={[styles.rowInput, { width: 50 }]} value={defaultEbike}
                onChangeText={setDefaultEbike} keyboardType="number-pad" returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss} />
              <Text style={styles.rowUnit}>min</Text>
            </View>
          } />
          <SettingsRow label="Auto-sync steps" right={
            <Switch
              value={autoSteps}
              onValueChange={setAutoSteps}
              trackColor={{ false: COLORS.background, true: COLORS.purpleImperial }}
              thumbColor={COLORS.silverBright}
            />
          } last />
        </Card>

        {/* Notifications */}
        <SectionLabel>NOTIFICATIONS</SectionLabel>
        <Card style={{ padding: 0 }}>
          <SettingsRow label="Daily reminder" right={
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: COLORS.background, true: COLORS.purpleImperial }}
              thumbColor={COLORS.silverBright}
            />
          } />
          <SettingsRow label="Time" right={
            <TextInput style={styles.rowInput} value={reminderTime} onChangeText={setReminderTime}
              returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
          } last />
        </Card>

        <GradientButton label="SAVE SETTINGS" onPress={saveSettings} style={{ marginBottom: 18 }} />

        {/* Data */}
        <SectionLabel>DATA</SectionLabel>
        <Card style={{ padding: 0 }}>
          <TouchableOpacity onPress={handleReset}>
            <SettingsRow label="Reset all data" labelColor={COLORS.warning} right={
              <FontAwesome name="trash" size={14} color={COLORS.warning} />
            } last />
          </TouchableOpacity>
        </Card>

        {/* About */}
        <SectionLabel>ABOUT</SectionLabel>
        <Card style={{ padding: 0 }}>
          <SettingsRow label="Version" right={<Text style={styles.rowValue}>1.0.0</Text>} />
          <TouchableOpacity onPress={() => setExpandPoem(!expandPoem)}>
            <View style={[styles.settingsRow, { borderBottomWidth: expandPoem ? 1 : 0 }]}>
              <Text style={[styles.rowLabel, { color: COLORS.gold, fontFamily: FONTS.serifItalic, fontStyle: 'italic', fontSize: 15 }]}>
                The Invictus Poem
              </Text>
              <FontAwesome name={expandPoem ? 'chevron-up' : 'chevron-down'} size={10} color={COLORS.gold} />
            </View>
          </TouchableOpacity>
          {expandPoem && (
            <View style={styles.poemContainer}>
              <Text style={styles.poemText}>
                Out of the night that covers me,{'\n'}
                Black as the pit from pole to pole,{'\n'}
                I thank whatever gods may be{'\n'}
                For my unconquerable soul.
              </Text>
              <Text style={styles.poemStar}>{'\u2734'}</Text>
              <Text style={styles.poemText}>
                In the fell clutch of circumstance{'\n'}
                I have not winced nor cried aloud.{'\n'}
                Under the bludgeonings of chance{'\n'}
                My head is bloody, but unbowed.
              </Text>
              <Text style={styles.poemStar}>{'\u2734'}</Text>
              <Text style={styles.poemText}>
                Beyond this place of wrath and tears{'\n'}
                Looms but the Horror of the shade,{'\n'}
                And yet the menace of the years{'\n'}
                Finds, and shall find me, unafraid.
              </Text>
              <Text style={styles.poemStar}>{'\u2734'}</Text>
              <Text style={styles.poemText}>
                It matters not how strait the gate,{'\n'}
                How charged with punishments the scroll,{'\n'}
                I am the master of my fate,{'\n'}
                I am the captain of my soul.
              </Text>
              <Text style={styles.poemAttrib}>{'\u2014'} W. E. HENLEY {'\u00B7'} 1875</Text>
            </View>
          )}
        </Card>

        <Text style={styles.footer}>{'\u2670'} INVICTVS {'\u2670'}</Text>
        <Text style={styles.footerSub}>I am the captain of my soul</Text>
      </ScrollView>
    </View>
  );
}

function SettingsRow({ label, right, last, labelColor }: {
  label: string; right: React.ReactNode; last?: boolean; labelColor?: string;
}) {
  return (
    <View style={[styles.settingsRow, !last && { borderBottomWidth: 1 }]}>
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : undefined]}>{label}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.borderBright, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontFamily: FONTS.serif, color: COLORS.silverBright },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  settingsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 18, borderBottomColor: COLORS.border,
  },
  rowLabel: { fontSize: 15, fontFamily: FONTS.serif, color: COLORS.silverBright },
  rowValue: { fontSize: 13, fontFamily: FONTS.mono, color: COLORS.silverDim },
  rowInput: {
    fontSize: 13, fontFamily: FONTS.mono, color: COLORS.silverDim,
    textAlign: 'right', padding: 0, minWidth: 60,
  },
  rowUnit: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.textMuted },

  miniToggle: {
    flexDirection: 'row', gap: 4, padding: 3,
    backgroundColor: COLORS.background, borderRadius: 7, borderWidth: 1, borderColor: COLORS.borderBright,
  },
  miniToggleBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 5 },
  miniToggleBtnActive: { backgroundColor: COLORS.purpleImperial },
  miniToggleText: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.2, textTransform: 'uppercase' },

  poemContainer: { paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  poemText: { fontFamily: FONTS.serif, fontSize: 13, color: COLORS.silver, lineHeight: 22, textAlign: 'center' },
  poemStar: { fontSize: 8, color: COLORS.gold, marginVertical: 14 },
  poemAttrib: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, marginTop: 14, textTransform: 'uppercase' },

  footer: { fontSize: 12, fontFamily: FONTS.mono, color: COLORS.silver, textAlign: 'center', marginTop: 32, fontWeight: '700', letterSpacing: 2 },
  footerSub: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },
});
