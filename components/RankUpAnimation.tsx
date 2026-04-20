import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { Starfield } from '@/components/Starfield';
import { SaintFigure, Halo } from '@/components/SpiritualIcons';
import { getSaintById } from '@/lib/saints';
import { RANK_SAINTS } from '@/lib/rankSaints';
import { toRoman } from '@/lib/roman';

interface RankUpAnimationProps {
  rank: string;
  rankIndex: number;
  visible: boolean;
  onDismiss: () => void;
}

export function RankUpAnimation({ rank, rankIndex, visible, onDismiss }: RankUpAnimationProps) {
  const rankSaint = RANK_SAINTS[rank];
  const saint = rankSaint ? getSaintById(rankSaint.saintId) : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDismiss}>
        <LinearGradient
          colors={['rgba(61,46,95,0.95)', 'rgba(7,6,12,0.98)']}
          style={StyleSheet.absoluteFill}
        />
        <Starfield density="dense" height={800} />
        <View style={styles.content}>
          <Text style={styles.ascended}>ASCENDED</Text>
          <View style={styles.haloContainer}>
            <Halo size={140} color={COLORS.gold} />
            <View style={styles.saintOverlay}>
              <SaintFigure size={100} robeColor={saint?.color || COLORS.purpleImperial} />
            </View>
          </View>
          <Text style={styles.rankNum}>rank {toRoman(rankIndex + 1)}</Text>
          <Text style={styles.rankName}>{rank}</Text>
          {saint && (
            <Text style={styles.saintName}>by intercession of {saint.name}</Text>
          )}
          {rankSaint && (
            <Text style={styles.theme}>{rankSaint.theme}</Text>
          )}
        </View>
        <Text style={styles.tapHint}>TAP TO CONTINUE</Text>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { alignItems: 'center' },
  ascended: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    letterSpacing: 4,
    color: COLORS.gold,
    textTransform: 'uppercase',
  },
  haloContainer: { marginVertical: 20, alignItems: 'center', justifyContent: 'center' },
  saintOverlay: { position: 'absolute', top: 20 },
  rankNum: { fontSize: 16, fontFamily: FONTS.serifItalic, color: COLORS.gold, marginTop: -10 },
  rankName: { fontSize: 38, fontFamily: FONTS.serif, color: COLORS.silverBright, marginTop: 4 },
  saintName: { fontSize: 14, fontFamily: FONTS.serifItalic, color: COLORS.silverDim, marginTop: 6 },
  theme: { fontSize: 12, fontFamily: FONTS.serifItalic, color: COLORS.silverDim, marginTop: 4, opacity: 0.7 },
  tapHint: {
    position: 'absolute',
    bottom: 60,
    fontSize: 9,
    fontFamily: FONTS.mono,
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
});
