import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { toRoman } from '@/lib/roman';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { Card, SectionLabel } from '@/components/Card';
import { Starfield } from '@/components/Starfield';
import { ProgressBar } from '@/components/ProgressBar';
import { OrthodoxCross, ChiRho } from '@/components/SpiritualIcons';
import { generateTemplateSummary, getCachedSummary, type CoachSummary, type WeekStats } from '@/lib/coach';

function computeWeekStats(data: any, weekNum: number): WeekStats {
  const entries = Object.values(data.entries || {}) as any[];
  const weekEntries = entries.slice(-7);
  const weights = weekEntries.filter((e: any) => e.weight != null).map((e: any) => e.weight);
  const calories = weekEntries.filter((e: any) => e.calories != null).map((e: any) => e.calories);
  const sleeps = weekEntries.filter((e: any) => e.sleep != null).map((e: any) => e.sleep);
  const sessions = (data.sessions || []).filter((s: any) => s.week === weekNum && s.completed);
  const prs = (data.sets || []).filter((s: any) => s.week === weekNum && s.isPR).length;

  const avg = (arr: number[]) => arr.length ? arr.reduce((s: number, v: number) => s + v, 0) / arr.length : 0;
  const avgCal = avg(calories);
  const tdee = 3200;

  return {
    sessions: sessions.length,
    sessionsPlanned: 5,
    weightStart: weights[0] || data.profile?.startingWeight || 130,
    weightEnd: weights[weights.length - 1] || weights[0] || 130,
    weightChange: weights.length >= 2 ? weights[weights.length - 1] - weights[0] : 0,
    avgDeficit: Math.round(avgCal - tdee),
    tonnage: (data.sets || [])
      .filter((s: any) => s.week === weekNum)
      .reduce((sum: number, s: any) => sum + (s.weight || 0) * (s.reps || 0), 0),
    avgSleep: avg(sleeps) || 7.5,
    prs,
  };
}

export default function ReflectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data } = useAppData();
  const programStart = data?.settings?.programStart ?? '2026-04-14';
  const { week, block } = useCurrentProgram(programStart);
  const [summary, setSummary] = useState<CoachSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    if (!data) return null;
    return computeWeekStats(data, week);
  }, [data, week]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const cached = await getCachedSummary(week);
      if (cached && mounted) { setSummary(cached); setLoading(false); return; }
      if (stats && mounted) {
        const s = generateTemplateSummary(stats, week);
        setSummary(s);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [week, stats]);

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const rangeStr = `${startOfWeek.getDate()}–${endOfWeek.getDate()} ${today.toLocaleDateString('en-US', { month: 'long' })}`;

  const virtues = [
    { name: 'Discipline', done: 7, total: 7, color: COLORS.gold },
    { name: 'Patience', done: 6, total: 7, color: COLORS.success },
    { name: 'Stillness', done: 5, total: 7, color: COLORS.purpleWarm },
    { name: 'Courage', done: 6, total: 7, color: COLORS.squat },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backArrow}>{'\u2039'}</Text>
          </TouchableOpacity>
          <Text style={styles.sundayLabel}>SUNDAY REFLECTION</Text>
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.dayLabel}>{dayOfWeek} · THE LORD&apos;S DAY</Text>
          <Text style={styles.mainTitle}>Weekly Reflection</Text>
          <Text style={styles.weekSubtitle}>Week {toRoman(week)} · {rangeStr}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : summary ? (
          <>
            <Card glow style={{ marginBottom: 12, overflow: 'hidden' }}>
              <Starfield density="sparse" height={200} />
              <View style={{ position: 'relative' }}>
                <View style={styles.coachHeader}>
                  <SectionLabel>COACH&apos;S WORD</SectionLabel>
                  <ChiRho size={14} color={COLORS.gold} />
                </View>
                <Text style={styles.coachText}>{summary.whatHappened}</Text>
                {summary.whatToWatch ? (
                  <Text style={[styles.coachText, { marginTop: 12 }]}>{summary.whatToWatch}</Text>
                ) : null}
                {summary.wordFromFathers ? (
                  <Text style={[styles.coachText, { marginTop: 12 }]}>{summary.wordFromFathers}</Text>
                ) : null}
                <Text style={styles.compiledFrom}>
                  COMPILED FROM {stats?.sessions || 0} SESSIONS
                </Text>
              </View>
            </Card>

            <View style={styles.statsGrid}>
              {[
                ['SESSIONS', `${stats?.sessions || 0} / ${stats?.sessionsPlanned || 5}`, COLORS.purpleWarm],
                ['BW CHANGE', `${(stats?.weightChange || 0) > 0 ? '+' : ''}${(stats?.weightChange || 0).toFixed(1)} kg`, COLORS.success],
                ['AVG DEFICIT', `${stats?.avgDeficit || 0} kcal`, COLORS.success],
                ['TONNAGE', `${((stats?.tonnage || 0) / 1000).toFixed(1)}t`, COLORS.silver],
                ['SLEEP AVG', `${(stats?.avgSleep || 0).toFixed(1)} hrs`, COLORS.gold],
                ['PRS', `${stats?.prs || 0}`, COLORS.gold],
              ].map(([label, value, color], i) => (
                <View key={i} style={styles.statBox}>
                  <Text style={styles.statLabel}>{label as string}</Text>
                  <Text style={[styles.statValue, { color: color as string }]}>{value as string}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <Card style={{ marginBottom: 12 }}>
          <SectionLabel>VIRTUES · 7 DAYS</SectionLabel>
          <View style={styles.virtueList}>
            {virtues.map((v, i) => (
              <View key={i} style={styles.virtueRow}>
                <OrthodoxCross size={12} color={v.color} />
                <View style={{ flex: 1 }}>
                  <View style={styles.virtueHeader}>
                    <Text style={styles.virtueName}>{v.name}</Text>
                    <Text style={styles.virtueScore}>{v.done} / {v.total}</Text>
                  </View>
                  <ProgressBar
                    progress={v.done / v.total}
                    color={v.done === v.total ? COLORS.gold : COLORS.purpleWarm}
                    height={2}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <SectionLabel>NEXT WEEK · {toRoman(week + 1)} OF {toRoman(block.weeks[1])}</SectionLabel>
          <View style={styles.focusList}>
            {[
              ['Protect sleep — 7.5h minimum', COLORS.warning],
              ['Bench intensity day: aim for a PR', COLORS.bench],
              ['Bodyweight target: stay the course', COLORS.success],
            ].map(([text, color], i) => (
              <View key={i} style={styles.focusRow}>
                <View style={[styles.focusDot, { backgroundColor: color as string }]} />
                <Text style={styles.focusText}>{text as string}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  backBtn: { padding: 6 },
  backArrow: { fontSize: 24, color: COLORS.silver },
  sundayLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.gold, textTransform: 'uppercase' },
  headerBlock: { marginBottom: 14 },
  dayLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.gold, textTransform: 'uppercase' },
  mainTitle: { fontSize: 26, fontFamily: FONTS.serif, color: COLORS.silverBright, marginTop: 4 },
  weekSubtitle: { fontSize: 12, fontFamily: FONTS.serifItalic, color: COLORS.silverDim, marginTop: 4 },
  coachHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  coachText: {
    fontSize: 15,
    fontFamily: FONTS.serifItalic,
    color: COLORS.silverBright,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  compiledFrom: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.textMuted, marginTop: 12, textTransform: 'uppercase' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    width: '48%',
    padding: 14,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
  },
  statLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.textMuted, textTransform: 'uppercase' },
  statValue: { fontSize: 22, fontFamily: FONTS.serif, marginTop: 4 },
  virtueList: { gap: 10, marginTop: 12 },
  virtueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  virtueHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  virtueName: { fontSize: 13, fontFamily: FONTS.serif, color: COLORS.silver },
  virtueScore: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.silverDim },
  focusList: { gap: 8, marginTop: 10 },
  focusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  focusDot: { width: 4, height: 4, borderRadius: 2 },
  focusText: { fontSize: 13, fontFamily: FONTS.serif, color: COLORS.silverBright },
});
