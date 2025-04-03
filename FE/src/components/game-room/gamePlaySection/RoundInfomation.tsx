import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

import GameMusicPlayer from '../gameScreen/GameMusicPlayer';
import GameResultContent from '../gameScreen/GameResultContent';
import RoundRolling from '../gameScreen/RoundRolling';
import YoutubePlayer from '../gameScreen/YoutubePlayer';

const RoundInformation = () => {
  const { gameState } = useGameStateStore();

  return (
    <div className='flex h-[300px] min-w-[60%] flex-col items-center justify-center rounded-2xl bg-black/80 p-4'>
      <YoutubePlayer />

      {(gameState === 'ROUND_INFO' || gameState === 'ROUND_OPEN') && (
        <RoundRolling />
      )}
      {gameState === 'GAME_END' && <GameResultContent />}

      {(gameState === 'ROUND_START' || gameState === 'GAME_RESULT') && (
        <GameMusicPlayer gameState={gameState} />
      )}
    </div>
  );
};

export default RoundInformation;
