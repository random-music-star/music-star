import { useGameScreenStore } from '@/stores/websocket/useGameScreenStore';
import { useEffect, useState } from 'react';
import GameWait from './GameWait';
import GameQuiz from './GameQuiz';
import GameResult from './GameResult';

type GameState = 'gameWait' | 'gameQuizOpened' | 'gameResultOpened' | null;

export default function GameBoard() {
  const { remainTime, songUrl, gameResult } = useGameScreenStore();
  const [gameState, setGameState] = useState<GameState>(null);

  useEffect(() => {
    if (songUrl) setGameState('gameQuizOpened');
    else if (gameResult) setGameState('gameResultOpened');
    else if (remainTime) setGameState('gameWait');
    else setGameState(null);
  }, [remainTime, songUrl, gameResult]);

  return (
    <div className='h-full flex flex-col p-4'>
      {gameState === 'gameWait' && <GameWait />}
      {gameState === 'gameQuizOpened' && <GameQuiz />}
      {gameState === 'gameResultOpened' && <GameResult />}
    </div>
  );
}
