import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { useReadiness } from '@/hooks/useReadiness';
import { useLiturgicalDay } from '@/hooks/useLiturgicalDay';
import { useDailyVerse } from '@/hooks/useDailyVerse';
import { Card, SectionLabel } from '@/components/Card';
import { Starfield } from '@/components/Starfield';
import { ReadinessGauge } from '@/components/ReadinessGauge';
import { ProgressBar } from '@/components/ProgressBar';
import { GradientButton } from '@/components/GradientButton';
import { CellIcon, Flame, Quill } from '@/components/SpiritualIcons';

export default function CellScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data } = useAppData();
  const readiness = useReadiness(data);
  const { liturgicalDay } = useLiturgicalDay();

  const programStart = data?.settings?.programStart ?? '2026-04-14';
  const { week } = useCurrentProgram(programStart);
  const { verse } = useDailyVerse(week, liturgicalDay);

  const colorForScore = (score: number) =>
    score >= 80 ? COLORS.success : score >= 60 ? COLORS.gold : COLORS.warning;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(61,46,95,0.5)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={StyleSheet.absoluteFill}
      />
      <Starfield density="dense" height={800} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backArrow}>{'\u2039'}</Text>
          </TouchableOpacity>
          <CellIcon size={18} color={COLORS.silver} />
          <Text style={styles.headerTitle}>The Cell</Text>
        </View>

        <Text style={styles.quote}>
          {'\u201C'}Go to your cell, and your cell will teach you everything.{'\u201D'}
          {'\n'}
          <Text style={styles.quoteAuthor}>{'\u2014'} ABBA MOSES</Text>
        </Text>

        <View style={styles.gaugeCenter}>
          <ReadinessGauge readiness={readiness} />
        </View>

        <Text style={styles.intentionLine}>Train with intention.</Text>

        <Card style={{ marginBottom: 14 }}>
          <SectionLabel>READINESS COMPONENTS</SectionLabel>
          <View style={styles.factorList}>
            {readiness.factors.map((f, i) => (
              <View key={i} style={styles.factorItem}>
                <View style={styles.factorHeader}>
                  <Text style={styles.factorName}>{f.name}</Text>
                  <View style={styles.factorValues}>
                    <Text style={styles.factorValue}>{f.value}</Text>
                    <Text style={[styles.factorScore, { color: colorForScore(f.score) }]}>{f.score}</Text>
                  </View>
                </View>
                <ProgressBar
                  progress={f.score / 100}
                  color={colorForScore(f.score)}
                  height={2}
                />
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <View style={styles.intentionHeader}>
            <SectionLabel>TODAY&apos;S INTENTION</SectionLabel>
            <Quill size={12} color={COLORS.silverDim} />
          </View>
          <Text style={styles.intentionText}>
            Move the weight with reverence. Every rep, one bow.
          </Text>
        </Card>

        {verse && (
          <Card style={{ marginBottom: 14 }}>
            <View style={styles.verseHeader}>
              <SectionLabel>VERSE OF THE DAY</SectionLabel>
            </View>
            <Text style={styles.verseText}>
              {'\u201C'}{verse.text}{'\u201D'}
            </Text>
            <Text style={styles.verseRef}>{verse.reference}</Text>
          </Card>
        )}

        <GradientButton
          label={`\u2604  BEGIN THE WORK`}
          onPress={() => router.replace('/(tabs)/workout')}
          style={{ marginTop: 16 }}
        />
        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.ghostText}>REST & RECOVER</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  backBtn: { padding: 6 },
  backArrow: { fontSize: 24, color: COLORS.silver },
  headerTitle: { fontSize: 22, fontFamily: FONTS.serif, color: COLORS.silverBright },
  quote: {
    fontSize: 14,
    fontFamily: FONTS.serifItalic,
    color: COLORS.silverDim,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 21,
  },
  quoteAuthor: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    fontStyle: 'normal',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },
  gaugeCenter: { alignItems: 'center', marginBottom: 18 },
  intentionLine: {
    fontSize: 15,
    fontFamily: FONTS.serifItalic,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: 18,
  },
  factorList: { gap: 10 },
  factorItem: {},
  factorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  factorName: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.silver, textTransform: 'uppercase' },
  factorValues: { flexDirection: 'row', gap: 8, alignItems: 'baseline' },
  factorValue: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.silverBright },
  factorScore: { fontSize: 10, fontFamily: FONTS.mono },
  intentionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  intentionText: {
    fontSize: 15,
    fontFamily: FONTS.serifItalic,
    color: COLORS.silverBright,
    lineHeight: 22.5,
    paddingVertical: 8,
  },
  verseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  verseText: {
    fontSize: 15,
    fontFamily: FONTS.serifItalic,
    color: COLORS.silverBright,
    lineHeight: 22.5,
  },
  verseRef: {
    fontSize: 11,
    fontFamily: FONTS.mono,
    color: COLORS.gold,
    letterSpacing: 1,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ghostBtn: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    borderRadius: 10,
  },
  ghostText: { fontSize: 11, fontFamily: FONTS.mono, letterSpacing: 1.8, color: COLORS.silver, textTransform: 'uppercase' },
});
