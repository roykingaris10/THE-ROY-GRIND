import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';
import type { TDEEBreakdown } from '@/types';
import { ProgressBar } from './ProgressBar';
import { formatNumber } from '@/lib/helpers';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface CalorieBalanceCardProps {
  caloriesIn: number;
  tdee: TDEEBreakdown;
  target: { min: number; max: number; phaseName: string };
  status: 'on-target' | 'mild-off' | 'way-off';
  compact?: boolean;
}

export function CalorieBalanceCard({ caloriesIn, tdee, target, status, compact }: CalorieBalanceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const net = caloriesIn - tdee.total;
  const statusColor = status === 'on-target' ? COLORS.success : status === 'mild-off' ? COLORS.primary : COLORS.danger;
  const midTarget = (target.min + target.max) / 2;

  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8} style={styles.card}>
      {!compact && <Text style={styles.title}>TODAY'S BALANCE</Text>}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>IN</Text>
          <Text style={[styles.bigNum, { color: COLORS.caloriesIn }]}>{formatNumber(caloriesIn)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>OUT</Text>
          <Text style={[styles.bigNum, { color: COLORS.caloriesOut }]}>{formatNumber(tdee.total)}</Text>
        </View>
      </View>
      <View style={styles.netRow}>
        <Text style={styles.netLabel}>NET:</Text>
        <Text style={[styles.netValue, { color: statusColor }]}>
          {net > 0 ? '+' : ''}{formatNumber(net)} kcal
        </Text>
      </View>
      <Text style={[styles.statusText, { color: statusColor }]}>
        {status === 'on-target' ? 'Within target' : status === 'mild-off' ? 'Slightly off target' : 'Off target'}
      </Text>
      <Text style={styles.targetText}>Target intake: {formatNumber(target.min)}–{formatNumber(target.max)} kcal</Text>
      {caloriesIn > 0 && (
        <View style={{ marginTop: 8 }}>
          <ProgressBar progress={caloriesIn / midTarget} color={statusColor} height={4} />
        </View>
      )}

      {expanded && (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>TDEE BREAKDOWN</Text>
          <BreakdownRow label={`BMR`} value={tdee.bmr} />
          <BreakdownRow label={`Steps`} value={tdee.steps} />
          <BreakdownRow label={`E-bike`} value={tdee.ebike} />
          <BreakdownRow label={`Training`} value={tdee.training} />
          <BreakdownRow label={`Other`} value={tdee.other} />
          <View style={styles.divider} />
          <BreakdownRow label="TOTAL TDEE" value={tdee.total} bold />
        </View>
      )}
    </TouchableOpacity>
  );
}

function BreakdownRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.bdRow}>
      <Text style={[styles.bdLabel, bold && styles.bdBold]}>{label}</Text>
      <Text style={[styles.bdValue, bold && styles.bdBold]}>{formatNumber(value)} kcal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 16, marginBottom: 12 },
  title: { fontSize: 10, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  col: { alignItems: 'center', flex: 1 },
  label: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  bigNum: { fontSize: 22, fontWeight: '900', fontFamily: mono },
  netRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: 8 },
  netLabel: { fontSize: 11, color: COLORS.textSecondary, fontFamily: mono, fontWeight: '600' },
  netValue: { fontSize: 20, fontWeight: '900', fontFamily: mono },
  statusText: { fontSize: 10, fontFamily: mono, textAlign: 'center', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },
  targetText: { fontSize: 10, color: COLORS.textMuted, fontFamily: mono, textAlign: 'center', marginTop: 4 },
  breakdown: { marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  breakdownTitle: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  bdRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  bdLabel: { fontSize: 11, color: COLORS.textSecondary, fontFamily: mono },
  bdValue: { fontSize: 11, color: COLORS.textPrimary, fontFamily: mono },
  bdBold: { fontWeight: '700', color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 6 },
});
