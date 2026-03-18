import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function Focus({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm4.25-12.15-5.54 3.56a1.5 1.5 0 0 0-.46.46l-3.56 5.54c-.35.54.16 1.18.73 1.05l.13-.04 5.54-3.56a1.5 1.5 0 0 0 .46-.46l3.56-5.54c.22-.35-.02-.78-.42-.88l-.13-.02-.31.09ZM12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
        fill={color}
      />
    </Svg>
  );
}
