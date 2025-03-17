import GameWait from './GameWait';
import GameResult from './GameResult';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';
import GamePlayer from './GamePlayer';

export default function GameBoard() {
  const { gameState } = useGameStateStore();

  return (
    <div className='flex h-full flex-col p-4'>
      {gameState === 'TIMER_WAIT' && <GameWait />}
      {(gameState === 'QUIZ_OPEN' || gameState === 'GAME_RESULT') && (
        <GamePlayer />
      )}
      {gameState === 'SCORE_UPDATE' && <GameResult />}
    </div>
  );
}
