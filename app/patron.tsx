import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { useAppData } from '@/hooks/useAppData';
import { SAINTS, type Saint } from '@/lib/saints';
import { Card } from '@/components/Card';
import { GradientButton } from '@/components/GradientButton';
import { SaintFigure, IconFrame, OrthodoxCross } from '@/components/SpiritualIcons';

const FEATURED_SAINTS = SAINTS.slice(0, 12);

export default function PatronScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, updateSettings } = useAppData();
  const currentPatron = data?.settings?.patronSaintId || 'george';
  const [selected, setSelected] = useState(currentPatron);

  const handleConfirm = async () => {
    await updateSettings({ patronSaintId: selected });
    router.back();
  };

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
          <Text style={styles.stepLabel}>PATRON SAINT</Text>
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.mainTitle}>Choose your Patron</Text>
          <Text style={styles.subtitle}>
            A saint to walk beside you through the 32 weeks. Their feast will mark your calendar; their virtue will anchor the cell.
          </Text>
        </View>

        <View style={styles.grid}>
          {FEATURED_SAINTS.map(s => {
            const active = selected === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelected(s.id)}
                activeOpacity={0.7}
                style={[
                  styles.saintCard,
                  active && styles.saintCardActive,
                ]}
              >
                {active && (
                  <View style={styles.activeStar}>
                    <Text style={styles.activeStarText}>{'\u2734'}</Text>
                  </View>
                )}
                <IconFrame width={90} height={100} glow={active}>
                  <View style={styles.iconBg}>
                    <SaintFigure size={50} robeColor={s.color} />
                  </View>
                </IconFrame>
                <Text style={[styles.saintName, active && styles.saintNameActive]}>{s.name}</Text>
                <Text style={styles.saintTitle}>{s.title}</Text>
                <Text style={styles.saintVirtue}>{s.archetype.toUpperCase()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <GradientButton label="CONFIRM PATRON" onPress={handleConfirm} style={{ marginTop: 18 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  backBtn: { padding: 6 },
  backArrow: { fontSize: 24, color: COLORS.silver },
  stepLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.gold, textTransform: 'uppercase' },
  headerBlock: { marginBottom: 18 },
  mainTitle: { fontSize: 26, fontFamily: FONTS.serif, color: COLORS.silverBright, marginTop: 2 },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.serifItalic,
    color: COLORS.silverDim,
    marginTop: 6,
    lineHeight: 19.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  saintCard: {
    width: '48%',
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  saintCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(107,78,158,0.2)',
  },
  activeStar: { position: 'absolute', top: 6, right: 6 },
  activeStarText: { fontSize: 10, color: COLORS.gold },
  iconBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(61,46,95,0.4)',
  },
  saintName: { fontSize: 13, fontFamily: FONTS.serif, color: COLORS.silverBright, marginTop: 8, textAlign: 'center', lineHeight: 16 },
  saintNameActive: { color: COLORS.silverBright },
  saintTitle: { fontSize: 10, fontFamily: FONTS.serifItalic, color: COLORS.silverDim, marginTop: 2, textAlign: 'center' },
  saintVirtue: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.gold, marginTop: 6, textTransform: 'uppercase' },
});
