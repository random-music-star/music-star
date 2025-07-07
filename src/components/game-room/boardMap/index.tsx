import { useEffect } from 'react';

import { useShallow } from 'zustand/shallow';

import { BOARD_MAP_SOUNDS } from '@/constants/config/soundConfig';
import useSound from '@/hooks/useSound';
import { cn } from '@/lib/utils';
import { useSoundEventStore } from '@/stores/useSoundEventStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

import GamePlaySection from '../gamePlaySection';
import GameBoard from './GameBoard';

const BoardMap = () => {
  const gameState = useGameStateStore(state => state.gameState);
  const { soundEvent, setSoundEvent } = useSoundEventStore(
    useShallow(state => ({
      soundEvent: state.soundEvent,
      setSoundEvent: state.setSoundEvent,
    })),
  );

  const { play, stop } = useSound(BOARD_MAP_SOUNDS);

  useEffect(() => {
    if (soundEvent) play(soundEvent);
    setSoundEvent(null);
  }, [soundEvent, play, setSoundEvent]);

  useEffect(() => {
    return () => {
      stop();
      setSoundEvent(null);
    };
  }, [stop, setSoundEvent]);

  return (
    <div className='relative h-screen w-full overflow-hidden'>
      <div
        className={cn(
          gameState === 'SCORE_UPDATE' ? '-translate-y-full' : 'translate-y-0',
          'transition-transform duration-700 ease-in-out',
        )}
      >
        <GamePlaySection />
      </div>
      <div
        className={cn(
          'absolute top-0 left-0 h-full w-full transition-transform duration-700 ease-in-out',
          gameState === 'SCORE_UPDATE' ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <GameBoard />
      </div>
    </div>
  );
};

export default BoardMap;
