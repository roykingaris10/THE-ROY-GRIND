import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface StatCalloutProps {
  value: string;
  unit?: string;
  label?: string;
  subtitle?: string;
  color?: string;
  size?: 'small' | 'large';
}

export function StatCallout({
  value,
  unit,
  label,
  subtitle,
  color = COLORS.textPrimary,
  size = 'small',
}: StatCalloutProps) {
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      {label && (
        <Text style={[styles.label, isLarge && styles.labelLarge]}>{label}</Text>
      )}
      <View style={styles.valueRow}>
        <Text style={[styles.value, isLarge && styles.valueLarge, { color }]}>
          {value}
        </Text>
        {unit && (
          <Text style={[styles.unit, isLarge && styles.unitLarge, { color }]}>
            {unit}
          </Text>
        )}
      </View>
      {subtitle && (
        <Text style={[styles.subtitle, isLarge && styles.subtitleLarge]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    minWidth: 72,
  },
  containerLarge: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    minWidth: 100,
  },
  label: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontFamily: mono,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  labelLarge: {
    fontSize: 10,
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: mono,
  },
  valueLarge: {
    fontSize: 32,
  },
  unit: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: mono,
    opacity: 0.7,
  },
  unitLarge: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontFamily: mono,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  subtitleLarge: {
    fontSize: 10,
    marginTop: 6,
  },
});
