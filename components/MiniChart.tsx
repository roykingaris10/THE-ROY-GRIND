import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Polyline, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { COLORS } from '@/lib/constants';

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function MiniChart({ data, color = COLORS.silver, height = 40, width: propWidth }: MiniChartProps) {
  const width = propWidth || 120;
  if (data.length < 2) {
    return (
      <View style={[styles.container, { height, width }]}>
        <Svg width={width} height={height}>
          <Line x1={4} y1={height / 2} x2={width - 4} y2={height / 2} stroke={COLORS.border} strokeWidth={1} />
        </Svg>
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 6;
  const cH = height - pad * 2;
  const cW = width - pad * 2;
  const stepX = cW / (data.length - 1);

  const points = data.map((val, i) => ({
    x: pad + i * stepX,
    y: pad + cH - ((val - min) / range) * cH,
  }));

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0].x},${height} ${linePoints} ${points[points.length - 1].x},${height}`;

  return (
    <View style={[styles.container, { height, width }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={`miniGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Area fill */}
        <Polygon points={areaPoints} fill={`url(#miniGrad-${color})`} />

        {/* Line */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.6}
        />

        {/* Dots */}
        {points.map((pt, i) => {
          const isLast = i === points.length - 1;
          return (
            <React.Fragment key={`dot-${i}`}>
              {isLast && (
                <Circle cx={pt.x} cy={pt.y} r={6} fill={color} opacity={0.15} />
              )}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={isLast ? 3.5 : 2}
                fill={color}
                opacity={isLast ? 1 : 0.7}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden' },
});
