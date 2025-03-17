import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

import GameQuiz from './GameQuiz';
import GameResult from './GameResult';
import GameWait from './GameWait';

export default function GameBoard() {
  const { gameState } = useGameStateStore();

  return (
    <div className='flex h-full flex-col p-4'>
      {gameState === 'TIMER_WAIT' && <GameWait />}
      {gameState === 'QUIZ_OPEN' && <GameQuiz />}
      {(gameState === 'GAME_RESULT' || gameState === 'SCORE_UPDATE') && (
        <GameResult />
      )}
    </div>
  );
}
