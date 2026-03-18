import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function Inbox({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 12h-3.59c-.55 0-1.05.22-1.42.59L12.59 17H11.4l-1.4-1.41c-.37-.37-.87-.59-1.42-.59H5V5h14v10Z"
        fill={color}
      />
    </Svg>
  );
}
