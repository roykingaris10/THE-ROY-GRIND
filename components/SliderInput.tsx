import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/lib/constants';

interface SliderInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

function getSliderColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio <= 0.3) return '#FF4444';
  if (ratio <= 0.6) return '#FFAA44';
  return '#44FF88';
}

export function SliderInput({ label, value, min = 1, max = 10, onChange }: SliderInputProps) {
  const items = [];
  for (let i = min; i <= max; i++) {
    items.push(i);
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: getSliderColor(value, max) }]}>{value}/{max}</Text>
      </View>
      <View style={styles.track}>
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => onChange(item)}
            style={[
              styles.segment,
              {
                backgroundColor: item <= value
                  ? getSliderColor(value, max)
                  : COLORS.border,
              },
            ]}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  value: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  track: {
    flexDirection: 'row',
    gap: 3,
  },
  segment: {
    flex: 1,
    height: 28,
    borderRadius: 4,
  },
});
