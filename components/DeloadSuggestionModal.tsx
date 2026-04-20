import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { Card } from '@/components/Card';
import { Starfield } from '@/components/Starfield';
import { GradientButton } from '@/components/GradientButton';
import { Dove } from '@/components/SpiritualIcons';
import type { DeloadSuggestion } from '@/lib/deloadSuggestion';

interface DeloadSuggestionModalProps {
  suggestion: DeloadSuggestion;
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

export function DeloadSuggestionModal({ suggestion, visible, onAccept, onDismiss }: DeloadSuggestionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <Starfield density="sparse" height={400} />
        <View style={styles.inner}>
          <View style={styles.handle} />

          <View style={styles.headerCenter}>
            <Dove size={34} color={COLORS.gold} />
            <Text style={styles.capsTitle}>A SEASON TO REST</Text>
            <Text style={styles.mainTitle}>Deload Suggested</Text>
          </View>

          <Text style={styles.description}>
            {suggestion.message}
          </Text>

          <Card style={styles.factorsCard}>
            {suggestion.reasons.map((r, i) => (
              <View key={i} style={[styles.factorRow, i < suggestion.reasons.length - 1 && styles.factorBorder]}>
                <Text style={styles.factorLabel}>{r.label}</Text>
                <Text style={[styles.factorDetail, { color: r.color }]}>{r.detail}</Text>
              </View>
            ))}
          </Card>

          <View style={styles.recommendation}>
            <Text style={styles.recLabel}>RECOMMENDED</Text>
            <Text style={styles.recText}>One week. Working sets at 60%. Three sessions, not five.</Text>
          </View>

          <GradientButton label="ACCEPT THE REST" onPress={onAccept} style={{ marginTop: 16 }} />
          <TouchableOpacity onPress={onDismiss} style={styles.ghostBtn} activeOpacity={0.7}>
            <Text style={styles.ghostText}>PRESS ON</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(201,169,97,0.4)',
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  inner: { position: 'relative', padding: 20, paddingBottom: 36 },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.borderBright,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerCenter: { alignItems: 'center', marginBottom: 16 },
  capsTitle: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    letterSpacing: 2.5,
    color: COLORS.gold,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  mainTitle: { fontSize: 22, fontFamily: FONTS.serif, color: COLORS.silverBright, marginTop: 6 },
  description: {
    fontSize: 14,
    fontFamily: FONTS.serifItalic,
    color: COLORS.silverDim,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 21,
  },
  factorsCard: { marginBottom: 14, padding: 12 },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  factorBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  factorLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.silver, textTransform: 'uppercase' },
  factorDetail: { fontSize: 11, fontFamily: FONTS.mono },
  recommendation: {
    padding: 12,
    backgroundColor: 'rgba(201,169,97,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,169,97,0.3)',
    borderRadius: 10,
  },
  recLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.gold, marginBottom: 4, textTransform: 'uppercase' },
  recText: { fontSize: 14, fontFamily: FONTS.serif, color: COLORS.silverBright },
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
