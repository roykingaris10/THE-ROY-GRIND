import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { Card } from '@/components/Card';
import { OrthodoxCross, Flame } from '@/components/SpiritualIcons';
import type { LiturgicalDay } from '@/lib/orthocal';

interface LiturgicalDayCardProps {
  day: LiturgicalDay;
}

export function LiturgicalDayCard({ day }: LiturgicalDayCardProps) {
  const title = day.titles?.[0] || 'Ordinary Day';
  const isFeast = day.feasts.length > 0;
  const isFasting = day.fast_level > 0;
  const commemorated = day.saints?.[0] || '';

  return (
    <Card style={styles.card}>
      <View style={styles.topGlow} />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>LITURGICAL DAY</Text>
          <Text style={styles.title}>{title}</Text>
          {day.readings?.length > 0 && (
            <Text style={styles.subtitle}>{day.readings[0].display}</Text>
          )}
        </View>
        <OrthodoxCross size={22} color={COLORS.gold} />
      </View>
      {(isFeast || isFasting) && (
        <View style={styles.pills}>
          {isFeast && (
            <View style={[styles.pill, styles.feastPill]}>
              <Flame size={8} color={COLORS.gold} />
              <Text style={[styles.pillText, { color: COLORS.gold }]}>FEAST</Text>
            </View>
          )}
          {isFasting && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{day.fast_level_desc || 'FAST DAY'}</Text>
            </View>
          )}
        </View>
      )}
      {commemorated ? (
        <View style={styles.commemorated}>
          <View style={{ flex: 1 }}>
            <Text style={styles.commLabel}>COMMEMORATED</Text>
            <Text style={styles.commName}>{commemorated}</Text>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, overflow: 'hidden' },
  topGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: '100%',
    opacity: 0.15,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  label: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.gold, textTransform: 'uppercase' },
  title: { fontSize: 17, fontFamily: FONTS.serif, color: COLORS.silverBright, marginTop: 3 },
  subtitle: { fontSize: 11, fontFamily: FONTS.serifItalic, color: COLORS.silverDim, marginTop: 2 },
  pills: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    backgroundColor: 'rgba(107,78,158,0.12)',
  },
  feastPill: { borderColor: 'rgba(201,169,97,0.4)', backgroundColor: 'rgba(201,169,97,0.1)' },
  pillText: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.2, color: COLORS.silver, textTransform: 'uppercase' },
  commemorated: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.textMuted, textTransform: 'uppercase' },
  commName: { fontSize: 13, fontFamily: FONTS.serif, color: COLORS.silver, marginTop: 2 },
});
