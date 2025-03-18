import { motion } from 'framer-motion';

import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

import GamePlayer from './GamePlayer';
import GameResult from './GameResult';
import GameWait from './GameWait';

export default function GameBoard() {
  const { gameState } = useGameStateStore();

  return (
    <motion.div
      key='game-board'
      className='h-full'
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className='flex h-full flex-col p-4'>
        {gameState === 'TIMER_WAIT' && <GameWait />}
        {(gameState === 'QUIZ_OPEN' || gameState === 'GAME_RESULT') && (
          <GamePlayer />
        )}
        {gameState === 'SCORE_UPDATE' && <GameResult />}
      </div>
    </motion.div>
  );
}
