import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/lib/constants';

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function MiniChart({ data, color = COLORS.primary, height = 40, width: propWidth }: MiniChartProps) {
  const width = propWidth || 120;

  if (data.length < 2) {
    return (
      <View style={[styles.container, { height, width }]}>
        <View style={[styles.emptyLine, { backgroundColor: COLORS.border }]} />
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const stepX = chartWidth / (data.length - 1);

  const points = data.map((val, i) => ({
    x: padding + i * stepX,
    y: padding + chartHeight - ((val - min) / range) * chartHeight,
  }));

  return (
    <View style={[styles.container, { height, width }]}>
      <View style={StyleSheet.absoluteFill}>
        {points.map((point, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          const dx = point.x - prev.x;
          const dy = point.y - prev.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: prev.x,
                top: prev.y,
                width: length,
                height: 1.5,
                backgroundColor: color,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: 'left center',
              }}
            />
          );
        })}
        {/* Current value dot */}
        <View
          style={{
            position: 'absolute',
            left: points[points.length - 1].x - 3,
            top: points[points.length - 1].y - 3,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  emptyLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: '50%',
    height: 1,
  },
});
