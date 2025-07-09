import { useEffect } from 'react';

import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';

import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

const RotatingLP = () => {
  const gameState = useGameStateStore(state => state.gameState);
  const controls = useAnimation();

  useEffect(() => {
    if (gameState !== 'ROUND_INFO' && gameState !== 'ROUND_OPEN') {
      controls.start({
        rotate: [0, 360],
        opacity: 1,
        transition: {
          repeat: Infinity,
          duration: 2,
          ease: 'linear',
        },
      });
    } else {
      controls.stop();
    }
  }, [gameState, controls]);

  return (
    <motion.div
      className='absolute -left-40 h-[300px] w-[300px] -translate-y-8 overflow-hidden rounded-full lg:-left-38 lg:-translate-y-12'
      animate={controls}
    >
      <div className='h-full w-full rounded-full'>
        <Image src='/lp.svg' alt='lp' fill className='object-cover' />
      </div>
    </motion.div>
  );
};

export default RotatingLP;
