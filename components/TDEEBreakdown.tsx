import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';
import { formatNumber } from '@/lib/helpers';
import type { TDEEBreakdown as TDEEType } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export function TDEEBreakdownView({ tdee, currentWeight }: { tdee: TDEEType; currentWeight: number }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TDEE BREAKDOWN</Text>
      <Row label={`BMR (at ${currentWeight}kg)`} value={tdee.bmr} />
      <Row label={`Steps`} value={tdee.steps} />
      <Row label={`E-bike`} value={tdee.ebike} />
      <Row label={`Training`} value={tdee.training} />
      <Row label={`Other`} value={tdee.other} />
      <View style={styles.divider} />
      <Row label="TOTAL TDEE" value={tdee.total} bold />
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.value, bold && styles.bold]}>{formatNumber(value)} kcal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  title: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { fontSize: 11, color: COLORS.textSecondary, fontFamily: mono },
  value: { fontSize: 11, color: COLORS.textPrimary, fontFamily: mono },
  bold: { fontWeight: '700', color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 6 },
});
