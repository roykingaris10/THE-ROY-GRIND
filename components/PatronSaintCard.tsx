import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { getSaintById, type Saint } from '@/lib/saints';
import { Card } from '@/components/Card';
import { Starfield } from '@/components/Starfield';
import { SaintFigure, IconFrame, OrthodoxCross } from '@/components/SpiritualIcons';

interface PatronSaintCardProps {
  saintId: string;
}

export function PatronSaintCard({ saintId }: PatronSaintCardProps) {
  const saint = getSaintById(saintId);
  if (!saint) return null;

  return (
    <Card style={styles.card}>
      <Starfield density="sparse" height={100} />
      <View style={styles.inner}>
        <IconFrame width={72} height={88} glow>
          <View style={styles.iconBg}>
            <SaintFigure size={44} robeColor={saint.color} />
          </View>
        </IconFrame>
        <View style={styles.info}>
          <Text style={styles.patronLabel}>YOUR PATRON</Text>
          <Text style={styles.name} numberOfLines={1}>{saint.name}</Text>
          <Text style={styles.title}>{saint.title}</Text>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <OrthodoxCross size={8} color={COLORS.gold} />
              <Text style={styles.pillText}>{saint.archetype.toUpperCase()}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>FEAST · {saint.feastDay}</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, overflow: 'hidden' },
  inner: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(61,46,95,0.4)',
  },
  info: { flex: 1 },
  patronLabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.gold, marginBottom: 2, textTransform: 'uppercase' },
  name: { fontSize: 17, fontFamily: FONTS.serif, color: COLORS.silverBright },
  title: { fontSize: 12, fontFamily: FONTS.serifItalic, color: COLORS.silverDim, marginTop: 2 },
  pills: { flexDirection: 'row', gap: 6, marginTop: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    backgroundColor: 'rgba(107,78,158,0.12)',
  },
  pillText: { fontSize: 8, fontFamily: FONTS.mono, letterSpacing: 1.2, color: COLORS.silver, textTransform: 'uppercase' },
});
