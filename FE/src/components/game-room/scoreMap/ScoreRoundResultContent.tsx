import { motion } from 'framer-motion';

import { useGameRoundResultStore } from '@/stores/websocket/useGameRoundResultStore';

const ScoreRoundResultContent = () => {
  const { gameRoundResult } = useGameRoundResultStore();

  if (!gameRoundResult) return null;

  return (
    <div className='flex h-full w-full items-center'>
      <motion.div
        className='w-full rounded-lg border border-purple-500/30 bg-purple-700/40 p-4 shadow-md backdrop-blur-sm'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className='flex flex-col'>
          {/* 승자 표시 */}
          {gameRoundResult.winner && (
            <motion.div
              className='mb-2 flex w-full justify-center'
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <motion.div
                className='rounded-full bg-green-500/40 px-4 py-1 text-center'
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(34, 197, 94, 0)',
                    '0 0 10px rgba(34, 197, 94, 0.7)',
                    '0 0 0px rgba(34, 197, 94, 0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className='text-base font-bold text-green-200'>
                  {gameRoundResult.winner}
                </span>
                <span className='ml-2 text-xl font-extrabold text-green-100'>
                  정답!
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* 가수 정보 */}
          <div className='mb-2 w-full'>
            <div className='mb-1 text-sm font-medium text-purple-300'>가수</div>
            <div className='text-xl font-bold break-words text-purple-100'>
              {gameRoundResult.singer || '정보 없음'}
            </div>
          </div>

          {/* 제목 정보 */}
          <div className='w-full'>
            <div className='mb-1 text-sm font-medium text-purple-300'>제목</div>
            <div className='text-xl font-bold break-words text-purple-100'>
              {gameRoundResult.songTitle || '정보 없음'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreRoundResultContent;
