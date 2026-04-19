import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/constants';

interface ConstellationChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showGrid?: boolean;
}

export function ConstellationChart({
  data,
  color = COLORS.silver,
  height = 60,
  width: propWidth,
  showGrid = false,
}: ConstellationChartProps) {
  const width = propWidth || 200;

  if (data.length < 2) {
    return (
      <View style={[styles.container, { height, width }]}>
        {data.length === 1 && (
          <View
            style={{
              position: 'absolute',
              left: width / 2 - 4,
              top: height / 2 - 4,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: color,
            }}
          />
        )}
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 8;
  const cH = height - pad * 2;
  const cW = width - pad * 2;
  const stepX = cW / (data.length - 1);

  const points = data.map((val, i) => ({
    x: pad + i * stepX,
    y: pad + cH - ((val - min) / range) * cH,
  }));

  // Grid lines (horizontal)
  const gridCount = 3;
  const gridLines = showGrid
    ? Array.from({ length: gridCount }, (_, i) => pad + (cH / (gridCount + 1)) * (i + 1))
    : [];

  return (
    <View style={[styles.container, { height, width }]}>
      <View style={StyleSheet.absoluteFill}>
        {/* Subtle grid lines */}
        {gridLines.map((y, i) => (
          <View
            key={`grid-${i}`}
            style={{
              position: 'absolute',
              left: pad,
              right: pad,
              top: y,
              height: 1,
              backgroundColor: COLORS.border,
              opacity: 0.4,
            }}
          />
        ))}

        {/* Constellation lines */}
        {points.map((pt, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          const dx = pt.x - prev.x;
          const dy = pt.y - prev.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <View
              key={`line-${i}`}
              style={{
                position: 'absolute',
                left: prev.x,
                top: prev.y,
                width: len,
                height: 1,
                backgroundColor: color,
                opacity: 0.4,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: 'left center',
              }}
            />
          );
        })}

        {/* Star dots */}
        {points.map((pt, i) => {
          const isLast = i === points.length - 1;
          const isFirst = i === 0;
          const dotSize = isLast ? 8 : isFirst ? 6 : 5;
          const glowSize = dotSize + 6;
          return (
            <React.Fragment key={`star-${i}`}>
              {/* Outer glow */}
              <View
                style={{
                  position: 'absolute',
                  left: pt.x - glowSize / 2,
                  top: pt.y - glowSize / 2,
                  width: glowSize,
                  height: glowSize,
                  borderRadius: glowSize / 2,
                  backgroundColor: color,
                  opacity: isLast ? 0.2 : 0.08,
                }}
              />
              {/* Inner dot */}
              <View
                style={{
                  position: 'absolute',
                  left: pt.x - dotSize / 2,
                  top: pt.y - dotSize / 2,
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: color,
                  opacity: isLast ? 1 : 0.7,
                }}
              />
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden' },
});
