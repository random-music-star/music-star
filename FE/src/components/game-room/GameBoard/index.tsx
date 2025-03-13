import GameWait from './GameWait';
import GameQuiz from './GameQuiz';
import GameResult from './GameResult';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

export default function GameBoard() {
  const { gameState } = useGameStateStore();

  return (
    <div className='h-full flex flex-col p-4'>
      {gameState === 'gameWait' && <GameWait />}
      {gameState === 'gameQuizOpened' && <GameQuiz />}
      {(gameState === 'gameResultOpened' ||
        gameState === 'gameScoreUpdate') && <GameResult />}
    </div>
  );
}
