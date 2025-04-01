import { AnimatePresence, motion } from 'framer-motion';

import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

import YoutubePlayer from '../gamePlaySection/YoutubePlayer';
import ScoreGameMusicPlayer from './ScoreGameMusicPlayer';
import ScoreGameResultContent from './ScoreGameResultContent';
import ScoreRoundRolling from './ScoreRoundRolling';

const ScoreRoundInformation = () => {
  const { gameState } = useGameStateStore();

  // 각 상태에 맞는 애니메이션 효과를 위한 변수들
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

      <div className='h-full w-full rounded-lg bg-purple-800/50 p-3 shadow-inner backdrop-blur-sm'>
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
              <ScoreRoundRolling />
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
              <ScoreGameResultContent />
            </motion.div>
          )}

          {(gameState === 'ROUND_START' || gameState === 'GAME_RESULT') && (
            <motion.div
              key='music-player'
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className='h-full w-full'
            >
              <ScoreGameMusicPlayer gameState={gameState} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScoreRoundInformation;
