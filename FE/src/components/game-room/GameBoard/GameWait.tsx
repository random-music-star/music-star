import React, { useEffect, useState } from 'react';

import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { useGameScreenStore } from '@/stores/websocket/useGameScreenStore';
import { Mode } from '@/types/websocket';

const GameWait = () => {
  const { remainTime } = useGameScreenStore();
  const { gameRoomInfo } = useGameInfoStore();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [positions, setPositions] = useState<number[]>([]);

  useEffect(() => {
    setPositions(gameRoomInfo.mode.map((_mode: Mode, i) => i + 1));
  }, [gameRoomInfo]);

  useEffect(() => {
    if (selectedMode) return;

    const interval = setInterval(() => {
      setPositions(prevPositions => {
        return prevPositions.map(pos => (pos <= -1 ? 2 : pos - 0.02));
      });
    }, 0.5);

    return () => clearInterval(interval);
  }, [selectedMode]);

  useEffect(() => {
    if (remainTime === 1 && !selectedMode) {
      setSelectedMode('한곡모드');
    }
  }, [remainTime, selectedMode]);

  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <div className='relative h-64 w-64 overflow-hidden'>
        {!selectedMode &&
          gameRoomInfo.mode.map((mode, index) => {
            const position = positions[index] || 0;
            const yPosition = position * 120;
            const opacity = position > 0 && position < 2 ? 1 : 0.4;
            const scale = position > 0 && position < 2 ? 1 : 0.95;
            const zIndex = 10 - Math.floor(position * 10);

            return (
              <div
                key={mode}
                className='absolute flex h-36 w-full items-center justify-center rounded-lg bg-white shadow-lg transition-transform duration-75 ease-linear'
                style={{
                  transform: `translateY(${yPosition}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  top: '20%',
                }}
              >
                <div className='p-4 text-center'>
                  <h3 className='mb-2 text-2xl font-bold'>{mode}</h3>
                </div>
              </div>
            );
          })}

        {selectedMode && (
          <div
            className='absolute flex h-36 w-full animate-pulse items-center justify-center rounded-lg bg-white shadow-lg'
            style={{ top: '20%' }}
          >
            <div className='p-4 text-center'>
              <h3 className='mb-2 text-3xl font-bold'>{selectedMode}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameWait;
