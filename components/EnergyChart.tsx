import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { OrbitColors } from '../constants/Colors';

type Props = {
  points: number[];
  height?: number;
};

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function EnergyChart({ points, height = 84 }: Props) {
  const width = 320;

  const path = useMemo(() => {
    if (points.length < 2) return '';

    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = Math.max(1e-6, max - min);

    const dx = width / (points.length - 1);

    const toY = (p: number) => {
      const t = clamp01((p - min) / span);
      return height - t * height;
    };

    let d = `M 0 ${toY(points[0])}`;

    for (let i = 1; i < points.length; i++) {
      const x = dx * i;
      const y = toY(points[i]);
      d += ` L ${x} ${y}`;
    }

    return d;
  }, [height, points]);

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="orbitx_line" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={OrbitColors.spaceBlue} stopOpacity={0.9} />
            <Stop offset="1" stopColor={OrbitColors.neonGreen} stopOpacity={0.9} />
          </LinearGradient>
        </Defs>
        <Path d={path} fill="none" stroke="url(#orbitx_line)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    opacity: 0.95,
  },
});
