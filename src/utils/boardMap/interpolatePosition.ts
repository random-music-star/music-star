import { FootholderPosition } from '@/constants/boardMap/footholderRatios';

export function interpolatePosition(
  fromPos: FootholderPosition,
  toPos: FootholderPosition,
  progress: number,
  leftSectionWidth: number,
  windowHeight: number,
) {
  const easedT =
    progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  const fromX = fromPos.xRatio * leftSectionWidth;
  const fromY = fromPos.yRatio * windowHeight;
  const toX = toPos.xRatio * leftSectionWidth;
  const toY = toPos.yRatio * windowHeight;
  const x = fromX + (toX - fromX) * easedT;
  let y = fromY + (toY - fromY) * easedT;
  const jumpHeight = 30 * Math.sin(Math.PI * easedT);
  y -= jumpHeight;
  return { x, y };
}
