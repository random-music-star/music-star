import { AnimatePresence, motion } from 'framer-motion';

import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

import GameMusicPlayer from '../gameScreen/GameMusicPlayer';
import GameResultContent from '../gameScreen/GameResultContent';
import RoundRolling from '../gameScreen/RoundRolling';
import YoutubePlayer from '../gameScreen/YoutubePlayer';

const ScoreRoundInformation = () => {
  const { gameState } = useGameStateStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className='flex h-full min-w-[500px] flex-col items-center justify-center rounded-lg bg-gradient-to-br from-purple-900/90 to-purple-800/90 shadow-xl'>
      <div className='hidden'>
        <YoutubePlayer />
      </div>

      <div className='h-full w-full rounded-lg p-3 shadow-inner backdrop-blur-sm'>
        <AnimatePresence mode='wait'>
          {(gameState === 'ROUND_INFO' || gameState === 'ROUND_OPEN') && (
            <motion.div
              key='round-rolling'
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className='h-full w-full'
            >
              <RoundRolling />
            </motion.div>
          )}

          {gameState === 'GAME_END' && (
            <motion.div
              key='game-result'
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className='h-full w-full'
            >
              <GameResultContent />
            </motion.div>
          )}

          {(gameState === 'ROUND_START' ||
            gameState === 'GAME_RESULT' ||
            gameState === 'SCORE_UPDATE') && (
            <motion.div
              key='music-player'
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className='h-full w-full'
            >
              <GameMusicPlayer gameState={gameState} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScoreRoundInformation;
