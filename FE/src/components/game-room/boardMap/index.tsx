import { useEffect } from 'react';

import useSound from '@/hooks/useSound';
import { cn } from '@/lib/utils';
import { useSoundEventStore } from '@/stores/useSoundEventStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

import GamePlaySection from '../gamePlaySection';
import GameBoard from './GameBoard';

const BoardMap = () => {
  const { gameState } = useGameStateStore();
  const { soundEvent, setSoundEvent } = useSoundEventStore();

  const { play, stop } = useSound([
    { key: 'EVENT_CARD', url: '/audio/playsound/event-card.mp3' },
    { key: 'JUMP', url: '/audio/playsound/jump.mp3' },
    { key: 'ROULETTE', url: '/audio/playsound/roulette.mp3' },
    { key: 'ROULETTE_RESULT', url: '/audio/playsound/roulette-result.mp3' },
    { key: 'ROULETTE_123', url: '/audio/playsound/roulette-123.mp3' },
    {
      key: 'ROULETTE_123_RESULT',
      url: '/audio/playsound/roulette-123-result.mp3',
    },
    { key: 'CORRECT', url: '/audio/playsound/correct.mp3' },
    { key: 'WINNER', url: '/audio/playsound/winner.mp3' },
  ]);

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
