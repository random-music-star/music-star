import { useMemo } from 'react';

import { WindowSize } from './useWindowSize';

interface BoardConfig {
  padding: number;
}

export interface LayoutSize {
  paddedWidth: number;
  paddedHeight: number;
}

export const useBoardLayoutSize = (
  windowSize: WindowSize,
  config: BoardConfig,
) => {
  const layoutSize: LayoutSize = useMemo(() => {
    const paddedWidth = windowSize.width - config.padding * 2;
    const paddedHeight = windowSize.height - config.padding * 2;

    return { paddedWidth, paddedHeight };
  }, [windowSize.width, windowSize.height, config.padding]);

  return { layoutSize };
};
