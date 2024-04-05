import React from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export default function SquareHex({styles, size}) {
  return (
    <View style={styles}>
      <Svg height={size} width={size} viewBox="0 0 48 48">
        <Path
          d="M 0 0 L 48 0 L 48 48 L 0 48 Z"
          stroke="#000"
          strokeWidth="10"
          fill="none"
        />
      </Svg>
    </View>
  );
}
