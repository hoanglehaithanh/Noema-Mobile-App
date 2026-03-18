import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function Review({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M19 3h-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1H8V2c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-1 16H6c-.55 0-1-.45-1-1V8h14v10c0 .55-.45 1-1 1Zm-5.47-4.63-1.06-1.06a.996.996 0 1 0-1.41 1.41l1.77 1.77c.39.39 1.02.39 1.41 0l3.54-3.54a.996.996 0 1 0-1.41-1.41l-2.83 2.83Z"
        fill={color}
      />
    </Svg>
  );
}
