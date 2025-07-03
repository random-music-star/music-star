import React from 'react';

import { FOOTHOLDER_RATIOS } from '@/constants/boardMap/footholderRatios';

interface Props {
  paddedWidth: number;
  paddedHeight: number;
  padding: number;
}

const Footholders = ({ paddedWidth, paddedHeight, padding }: Props) => {
  const leftSectionWidth = paddedWidth * 0.75;
  const baseSize = Math.min(48, leftSectionWidth * 0.08);

  return (
    <>
      {FOOTHOLDER_RATIOS.map((position, index) => {
        const size = baseSize * (position.size || 1.5);
        const x = padding + position.xRatio * leftSectionWidth;
        const y = padding + position.yRatio * paddedHeight;
        return (
          <div
            key={`footholder-${index}`}
            className='footholder'
            style={{
              position: 'absolute',
              left: `${x - size / 2}px`,
              top: `${y - size / 2}px`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundImage: 'url(/footholder.svg)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
        );
      })}
    </>
  );
};

export default React.memo(Footholders);
