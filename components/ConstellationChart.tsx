import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
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
          <Svg width={width} height={height}>
            <Defs>
              <RadialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={color} stopOpacity="0.6" />
                <Stop offset="100%" stopColor={color} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={width / 2} cy={height / 2} r={8} fill="url(#starGlow)" />
            <Circle cx={width / 2} cy={height / 2} r={4} fill={color} opacity={0.9} />
          </Svg>
        )}
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 10;
  const cH = height - pad * 2;
  const cW = width - pad * 2;
  const stepX = cW / (data.length - 1);

  const points = data.map((val, i) => ({
    x: pad + i * stepX,
    y: pad + cH - ((val - min) / range) * cH,
  }));

  const gridCount = 3;
  const gridLines = showGrid
    ? Array.from({ length: gridCount }, (_, i) => pad + (cH / (gridCount + 1)) * (i + 1))
    : [];

  return (
    <View style={[styles.container, { height, width }]}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Grid */}
        {gridLines.map((y, i) => (
          <Line
            key={`grid-${i}`}
            x1={pad}
            y1={y}
            x2={width - pad}
            y2={y}
            stroke={COLORS.border}
            strokeWidth={0.5}
            opacity={0.4}
          />
        ))}

        {/* Lines */}
        {points.map((pt, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          return (
            <Line
              key={`line-${i}`}
              x1={prev.x}
              y1={prev.y}
              x2={pt.x}
              y2={pt.y}
              stroke={color}
              strokeWidth={1}
              opacity={0.35}
            />
          );
        })}

        {/* Star dots with glows */}
        {points.map((pt, i) => {
          const isLast = i === points.length - 1;
          const isFirst = i === 0;
          const dotR = isLast ? 4 : isFirst ? 3 : 2.5;
          const glowR = dotR + 6;
          return (
            <React.Fragment key={`star-${i}`}>
              <Circle cx={pt.x} cy={pt.y} r={glowR} fill="url(#dotGlow)" opacity={isLast ? 0.5 : 0.2} />
              <Circle cx={pt.x} cy={pt.y} r={dotR} fill={color} opacity={isLast ? 1 : 0.7} />
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
