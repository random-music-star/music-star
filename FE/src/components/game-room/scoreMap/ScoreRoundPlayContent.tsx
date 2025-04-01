import { motion } from 'framer-motion';

import { useRoundHintStore } from '@/stores/websocket/useRoundHintStore';

const ScoreRoundPlayContent = () => {
  const { roundHint } = useRoundHintStore();

  return (
    <div className='h-full w-full rounded-lg bg-purple-800/50 p-6 shadow-inner backdrop-blur-sm'>
      <motion.div
        className='space-y-8 pt-5'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className='flex items-center justify-between'>
          <span className='text-lg font-bold text-purple-300'>가수</span>
          <motion.span
            className='rounded-md bg-purple-700/40 px-4 py-1 text-xl font-extrabold text-purple-100'
            animate={
              roundHint && roundHint.singer
                ? {
                    scale: [1, 1.05, 1],
                    textShadow: [
                      '0px 0px 0px rgba(233, 213, 255, 0)',
                      '0px 0px 8px rgba(233, 213, 255, 0.5)',
                      '0px 0px 0px rgba(233, 213, 255, 0)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
          >
            {roundHint && roundHint.singer ? roundHint.singer : '잠시 후 공개'}
          </motion.span>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-lg font-bold text-purple-300'>제목</span>
          <motion.span
            className='rounded-md bg-purple-700/40 px-4 py-1 text-xl font-extrabold text-purple-100'
            animate={
              roundHint && roundHint.title
                ? {
                    scale: [1, 1.05, 1],
                    textShadow: [
                      '0px 0px 0px rgba(233, 213, 255, 0)',
                      '0px 0px 8px rgba(233, 213, 255, 0.5)',
                      '0px 0px 0px rgba(233, 213, 255, 0)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            {roundHint && roundHint.title ? roundHint.title : '잠시 후 공개'}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreRoundPlayContent;
