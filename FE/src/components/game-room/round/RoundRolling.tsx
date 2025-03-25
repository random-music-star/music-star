import React, { useEffect, useRef, useState } from 'react';

import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

// 타입 정의
type GameState = 'TIMER_WAIT' | 'ROUND_OPEN' | string;

interface GameRoomInfo {
  roomTitle?: string;
  hasPassword?: boolean;
  maxPlayer?: number;
  maxGameRound?: number;
  format?: string;
  selectedYear?: string[] | string;
  mode?: string[] | string;
  status?: string;
}

interface RoundInfo {
  mode: string;
}

const RoundRolling: React.FC = () => {
  const { gameRoomInfo } = useGameInfoStore() as {
    gameRoomInfo: GameRoomInfo | null;
  };
  const { roundInfo } = useGameRoundInfoStore() as {
    roundInfo: RoundInfo | null;
  };
  const { gameState } = useGameStateStore() as { gameState: GameState };

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);

  // 모드 옵션
  const modeOptions: string[] = ['한곡듣기', '1초듣기', 'AI듣기'];

  useEffect(() => {
    if (!gameRoomInfo) return;

    // ROUND_OPEN 상태면 선택 모드로 변경
    if (gameState === 'ROUND_OPEN') {
      setIsSelected(true);
      const targetIndex = modeOptions.indexOf('한곡듣기');
      setCurrentIndex(targetIndex >= 0 ? targetIndex : 0);

      // 애니메이션 정리
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    setIsSelected(false);
    const rollSpeed = 600;
    const animate = (timestamp: number): void => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;

      const elapsed = timestamp - lastTimestampRef.current;

      if (elapsed > rollSpeed) {
        setCurrentIndex(prevIndex => (prevIndex + 1) % modeOptions.length);
        lastTimestampRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameRoomInfo, gameState, modeOptions]);

  if (!gameRoomInfo) return null;
  if (!roundInfo) return null;

  // 현재 표시할 모드
  const displayMode = isSelected ? '한곡듣기' : modeOptions[currentIndex];

  return (
    <div className='w-full'>
      <h2 className='mb-3 text-center text-lg font-bold text-fuchsia-300'>
        이번 라운드는?
      </h2>
      <div className='flex w-full justify-evenly rounded-lg'>
        <div className='mr-4 overflow-hidden rounded-lg border border-purple-500/30 bg-purple-900/20 px-8 py-[10px]'>
          <div className='flex items-center justify-center'>
            <div
              className={`px-8 py-[10px] text-center font-bold transition-all duration-300 ${
                isSelected ? 'scale-150 text-fuchsia-300' : 'text-purple-100'
              }`}
            >
              {displayMode}
            </div>
          </div>
        </div>

        {/* 모드 목록 (미니 디스플레이) */}
        <div className='flex items-center justify-center gap-4'>
          {modeOptions.map((mode, index) => (
            <div
              key={mode}
              className={`h-fit rounded-full px-3 py-1 text-sm transition-all ${
                index === currentIndex
                  ? 'bg-purple-700/50 text-purple-100'
                  : 'bg-purple-900/30 text-purple-300/70'
              } ${isSelected && mode === '한곡듣기' ? 'bg-fuchsia-700/50 text-fuchsia-100' : ''}`}
            >
              {mode}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoundRolling;
