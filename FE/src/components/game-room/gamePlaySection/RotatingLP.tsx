import { useEffect, useState } from 'react';

import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';

import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

const RotatingLP = () => {
  const { gameState } = useGameStateStore();

  const [currentAngle, setCurrentAngle] = useState<number>(0);
  const controls = useAnimation();
  let animationInterval: number | null = null;

  useEffect(() => {
    if (gameState !== 'ROUND_INFO' && gameState !== 'ROUND_OPEN') {
      controls.start({
        rotate: [currentAngle, currentAngle + 360],
        opacity: 1,
        transition: {
          repeat: Infinity,
          duration: 2,
          ease: 'linear',
        },
      });

      animationInterval = window.setInterval(() => {
        setCurrentAngle(prev => (prev + 2) % 360);
      }, 10);
    } else {
      if (animationInterval !== null) {
        clearInterval(animationInterval);
        animationInterval = null;
      }

      controls.start({
        rotate: currentAngle,
        opacity: 1,
        transition: {
          duration: 0,
        },
      });
    }

    return () => {
      if (animationInterval !== null) {
        clearInterval(animationInterval);
        animationInterval = null;
      }
    };
  }, [gameState]);

  return (
    <motion.div
      className='absolute -left-40 h-[300px] w-[300px] -translate-y-8 overflow-hidden rounded-full lg:-left-38 lg:-translate-y-12'
      animate={controls}
      initial={{ rotate: currentAngle }}
    >
      <div className='h-full w-full rounded-full'>
        <Image src='/lp.svg' alt='lp' fill className='object-cover' />
      </div>
    </motion.div>
  );
};

export default RotatingLP;
