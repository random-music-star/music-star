import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/utils';
import { useSoundEventStore } from '@/stores/useSoundEventStore';
import { useGameDiceStore } from '@/stores/websocket/useGameDiceStore';

interface BubbleContentProps {
  isActive: boolean;
}
const BubbleContent = ({ isActive }: BubbleContentProps) => {
  const [currentImage, setCurrentImage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const { diceTotalmovement } = useGameDiceStore();
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const { setSoundEvent } = useSoundEventStore();

  const imagePaths = [
    '/eventemoji/move_1.png',
    '/eventemoji/move_2.png',
    '/eventemoji/move_3.png',
  ];

  useEffect(() => {
    if (isActive && !isAnimating) {
      setIsAnimating(true);
      setSoundEvent('ROULETTE_123');

      let count = 0;
      const startAnimation = () => {
        animationRef.current = setInterval(() => {
          count++;
          setCurrentImage(prev => (prev % 3) + 1);

          if (count >= 6) {
            if (animationRef.current) {
              clearInterval(animationRef.current);
            }
            if (diceTotalmovement) {
              setCurrentImage(diceTotalmovement);
              setSoundEvent('ROULETTE_123_RESULT');
            }
            setIsAnimating(false);
          }
        }, 167);
      };

      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isActive, diceTotalmovement]);

  useEffect(() => {
    if (!isActive) {
      setIsAnimating(false);
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
  }, [isActive]);

  if (!diceTotalmovement) return null;

  return (
    <div className='relative flex h-full w-full items-center justify-center'>
      {imagePaths.map((path, index) => (
        <Image
          key={index}
          className={cn(
            currentImage !== index + 1 ? 'opacity-0' : 'opacity-100',
            `absolute top-1/4 left-1/4 -mt-2 h-1/2 w-1/2 object-contain transition-opacity duration-100 ease-in-out`,
          )}
          src={path}
          alt={`Move ${index + 1}`}
          width={200}
          height={200}
        />
      ))}
    </div>
  );
};

export default BubbleContent;
