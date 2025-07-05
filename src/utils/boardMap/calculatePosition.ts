import {
  BOARD_CONFIG,
  UserCharacter,
} from '@/components/game-room/boardMap/GameBoard';
import { FOOTHOLDER_RATIOS } from '@/constants/boardMap/footholderRatios';
import { LayoutSize } from '@/hooks/useBoardLayoutSize';

import { interpolatePosition } from './interpolatePosition';

export const calculateStaticPosition = (
  character: UserCharacter,
  layoutSize: LayoutSize,
  leftSectionWidth: number,
) => {
  let x = 0,
    y = 0;

  const pos = FOOTHOLDER_RATIOS[character.position];
  if (!pos) return { x: 0, y: 0 };

  x = BOARD_CONFIG.padding + pos.xRatio * leftSectionWidth;
  y = BOARD_CONFIG.padding + pos.yRatio * layoutSize.paddedHeight;

  return { x, y };
};

export const calculateMovingPosition = (
  character: UserCharacter,
  layoutSize: LayoutSize,
  leftSectionWidth: number,
) => {
  let x = 0,
    y = 0;
  if (character.isMoving) {
    const fromPos = FOOTHOLDER_RATIOS[character.fromPosition];
    const toPos = FOOTHOLDER_RATIOS[character.toPosition];
    if (fromPos && toPos) {
      const pos = interpolatePosition(
        fromPos,
        toPos,
        character.moveProgress,
        leftSectionWidth,
        layoutSize.paddedHeight,
      );
      x = BOARD_CONFIG.padding + pos.x;
      y = BOARD_CONFIG.padding + pos.y;

      return { x, y };
    }
  }
  return { x: 0, y: 0 };
};
