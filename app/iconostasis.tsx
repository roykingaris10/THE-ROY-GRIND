import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { toRoman } from '@/lib/roman';
import { useAppData } from '@/hooks/useAppData';
import { Card, SectionLabel } from '@/components/Card';
import { Starfield } from '@/components/Starfield';
import { ProgressBar } from '@/components/ProgressBar';
import { SaintFigure, IconFrame, OrthodoxCross } from '@/components/SpiritualIcons';
import { RANK_ORDER, RANK_SAINTS, RANK_XP_THRESHOLDS, getRankForXP } from '@/lib/rankSaints';
import { getSaintById } from '@/lib/saints';

const RANK_UNLOCK_DESC = [
  'Week 1',
  '500 XP',
  '1,500 XP',
  '3,000 XP',
  '5,500 XP',
  '9,000 XP',
  '14,000 XP',
  '20,000 XP',
  '28,000 XP',
  '38,000 XP',
  '50,000 XP',
  '65,000 XP',
];

export default function IconostasisScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data } = useAppData();

  const xp = 2200;
  const { rank: currentRank, index: currentIdx, progress, xpToNext } = getRankForXP(xp);
  const currentSaint = RANK_SAINTS[currentRank];
  const saint = currentSaint ? getSaintById(currentSaint.saintId) : null;
  const nextRank = currentIdx < RANK_ORDER.length - 1 ? RANK_ORDER[currentIdx + 1] : null;

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
          <Text style={styles.mainTitle}>Iconostasis</Text>
        </View>

        <Text style={styles.subtitle}>
          Twelve relics. Twelve ranks. Each unlocked by the saint who guards it.
        </Text>

        <Card glow style={{ marginBottom: 16, padding: 14, alignItems: 'center', overflow: 'hidden' }}>
          <Starfield density="sparse" height={140} />
          <View style={{ position: 'relative', alignItems: 'center' }}>
            <Text style={styles.currentLabel}>CURRENT RANK · {toRoman(currentIdx + 1)}</Text>
            <Text style={styles.currentRank}>{currentRank}</Text>
            {saint && (
              <Text style={styles.guardedBy}>guarded by {saint.name}</Text>
            )}
            <View style={{ width: '100%', marginTop: 10 }}>
              <ProgressBar progress={progress} color={COLORS.gold} height={2} />
            </View>
            <Text style={styles.nextLabel}>
              {nextRank
                ? `NEXT · ${nextRank.toUpperCase()} · ${xpToNext} XP · ${Math.round(progress * 100)}%`
                : 'MAX RANK ACHIEVED'}
            </Text>
          </View>
        </Card>

        <View style={styles.grid}>
          {RANK_ORDER.map((rank, i) => {
            const isCurrent = i === currentIdx;
            const earned = i <= currentIdx;
            const locked = i > currentIdx;
            const rankSaint = RANK_SAINTS[rank];
            const s = rankSaint ? getSaintById(rankSaint.saintId) : null;

            return (
              <View
                key={i}
                style={[
                  styles.rankCard,
                  earned && styles.rankEarned,
                  isCurrent && styles.rankCurrent,
                  locked && styles.rankLocked,
                ]}
              >
                <View style={styles.rankIconWrap}>
                  {locked ? (
                    <View style={styles.lockedOverlay}>
                      <OrthodoxCross size={18} color={COLORS.textMuted} />
                    </View>
                  ) : (
                    <View style={styles.saintBg}>
                      <SaintFigure size={36} robeColor={s?.color || COLORS.purpleImperial} />
                    </View>
                  )}
                </View>
                <Text style={styles.rankNum}>{toRoman(i + 1)}</Text>
                <Text style={[styles.rankName, earned ? styles.rankNameEarned : styles.rankNameLocked]}>{rank}</Text>
                <Text style={styles.rankUnlock}>{RANK_UNLOCK_DESC[i]}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  backBtn: { padding: 6 },
  backArrow: { fontSize: 24, color: COLORS.silver },
  mainTitle: { fontSize: 24, fontFamily: FONTS.serif, color: COLORS.silverBright },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.serifItalic,
    color: COLORS.silverDim,
    marginBottom: 14,
    paddingLeft: 36,
  },
  currentLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.gold, textTransform: 'uppercase' },
  currentRank: { fontSize: 26, fontFamily: FONTS.serif, color: COLORS.silverBright, marginTop: 4 },
  guardedBy: { fontSize: 12, fontFamily: FONTS.serifItalic, color: COLORS.silverDim, marginTop: 2 },
  nextLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.textMuted, marginTop: 6, textTransform: 'uppercase' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rankCard: {
    width: '31%',
    padding: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  rankEarned: {
    borderColor: 'rgba(201,169,97,0.4)',
  },
  rankCurrent: {
    borderColor: COLORS.gold,
    ...Platform.select({
      ios: { shadowColor: COLORS.gold, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } },
      android: { elevation: 6 },
    }),
  },
  rankLocked: { opacity: 0.6 },
  rankIconWrap: {
    width: '100%',
    height: 70,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  saintBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(61,46,95,0.4)',
  },
  lockedOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,6,12,0.75)',
  },
  rankNum: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.gold, marginTop: 5, textTransform: 'uppercase' },
  rankName: { fontSize: 11, fontFamily: FONTS.serif, marginTop: 1, textAlign: 'center', lineHeight: 13 },
  rankNameEarned: { color: COLORS.silverBright },
  rankNameLocked: { color: COLORS.textMuted },
  rankUnlock: { fontSize: 7.5, fontFamily: FONTS.mono, letterSpacing: 1, color: COLORS.textMuted, marginTop: 3, textTransform: 'uppercase' },
});
