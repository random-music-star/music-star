import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

interface Character {
  id: number;
  position: number;
  isMoving: boolean;
  fromPosition: number;
  toPosition: number;
  moveProgress: number;
  moveStartTime: number;
}

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

const JumpingAnimation: React.FC = () => {
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const footholderRefs = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  if (footholderRefs.current.length === 0) {
    footholderRefs.current = Array.from({ length: 10 }, () =>
      React.createRef<HTMLDivElement>(),
    );
  }

  const [footholderPositions, setFootholderPositions] = useState<Position[]>(
    [],
  );

  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 1,
      position: 0,
      isMoving: false,
      fromPosition: 0,
      toPosition: 0,
      moveProgress: 0,
      moveStartTime: 0,
    },
    {
      id: 3,
      position: 4,
      isMoving: false,
      fromPosition: 4,
      toPosition: 4,
      moveProgress: 0,
      moveStartTime: 0,
    },
    {
      id: 5,
      position: 8,
      isMoving: false,
      fromPosition: 8,
      toPosition: 8,
      moveProgress: 0,
      moveStartTime: 0,
    },
  ]);

  const moveAnimationDuration = 1000;

  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const positions: Position[] = footholderRefs.current.map(ref => {
        const rect = ref.current?.getBoundingClientRect();
        return {
          x: (rect?.left ?? 0) + (rect?.width ?? 0) / 2 - containerRect.left,
          y: (rect?.top ?? 0) - containerRect.top,
          width: rect?.width ?? 0,
          height: rect?.height ?? 0,
        };
      });

      setFootholderPositions(positions);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setTimeout(() => startJump(1), 500);
      setTimeout(() => startJump(3), 1700);
      setTimeout(() => startJump(5), 2900);
    }, 500);

    return () => clearTimeout(initTimer);
  }, []);

  const startJump = (characterId: number) => {
    setCharacters(prev =>
      prev.map(char => {
        if (char.id === characterId && !char.isMoving) {
          const now = performance.now();
          const nextPosition = (char.position + 1) % 10;
          return {
            ...char,
            isMoving: true,
            fromPosition: char.position,
            toPosition: nextPosition,
            moveProgress: 0,
            moveStartTime: now,
          };
        }
        return char;
      }),
    );
  };

  useEffect(() => {
    const animate = (timestamp: number) => {
      setCharacters(prev =>
        prev.map(character => {
          if (character.isMoving) {
            const moveElapsed = timestamp - character.moveStartTime;
            const progress = Math.min(moveElapsed / moveAnimationDuration, 1);
            if (progress >= 1) {
              return {
                ...character,
                isMoving: false,
                position: character.toPosition,
                fromPosition: character.toPosition,
                moveProgress: 1,
              };
            } else {
              return {
                ...character,
                moveProgress: progress,
              };
            }
          }
          return character;
        }),
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    characters.forEach(character => {
      if (!character.isMoving && character.moveProgress === 1) {
        const delay = 1800 + Math.random() * 600;
        const timer = setTimeout(() => startJump(character.id), delay);
        return () => clearTimeout(timer);
      }
    });
  }, [characters]);

  const getCharacterPosition = (character: Character) => {
    if (footholderPositions.length === 0)
      return { left: '0', top: '0', opacity: 0 };

    if (
      character.isMoving &&
      character.fromPosition === 9 &&
      character.toPosition === 0
    ) {
      const fromPos = footholderPositions[character.fromPosition];
      const toPos = footholderPositions[character.toPosition];
      if (!fromPos || !toPos || !containerRef.current)
        return { left: '0', top: '0', opacity: 0 };

      const baseY = fromPos.y - 10;
      const exitPoint = fromPos.x + 150;
      const entryPoint = -50;

      const easeInOut = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      if (character.moveProgress < 0.5) {
        const progress = character.moveProgress * 2;
        const eased = easeInOut(progress);
        const x = fromPos.x + (exitPoint - fromPos.x) * eased;
        const y = baseY - 80 * Math.sin(Math.PI * progress);
        const opacity = 1 - Math.pow(progress, 2);
        return { left: `${x}px`, top: `${y}px`, opacity };
      } else {
        const progress = (character.moveProgress - 0.5) * 2;
        const eased = easeInOut(progress);
        const x = entryPoint + (toPos.x - entryPoint) * eased;
        const y = baseY - 80 * Math.sin(Math.PI * progress);
        const opacity = Math.pow(progress, 2);
        return { left: `${x}px`, top: `${y}px`, opacity };
      }
    }

    const fromPos = footholderPositions[character.fromPosition];
    const toPos = footholderPositions[character.toPosition % 10];
    if (!fromPos || !toPos) return { left: '0', top: '0', opacity: 0 };

    if (!character.isMoving) {
      return {
        left: `${fromPos.x}px`,
        top: `${fromPos.y - 10}px`,
        opacity: 1,
      };
    }

    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const t = easeInOut(character.moveProgress);
    const x = fromPos.x + (toPos.x - fromPos.x) * t;
    const baseY = fromPos.y - 10;
    const jumpHeight = 100;
    const y = baseY - jumpHeight * Math.sin(Math.PI * t);

    return {
      left: `${x}px`,
      top: `${y}px`,
      opacity: 1,
    };
  };

  return (
    <div
      className='relative h-[240px] w-full overflow-hidden'
      ref={containerRef}
    >
      {characters.map(character => (
        <div
          key={character.id}
          className='absolute z-20 h-16 w-12 transition-transform'
          style={{
            ...getCharacterPosition(character),
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Image
            src={`/character/character_${character.id}.svg`}
            alt={`Character ${character.id}`}
            fill
            className='object-contain'
          />
        </div>
      ))}

      <div className='absolute right-0 bottom-0 left-0 flex items-end justify-center gap-10'>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className='relative h-[70px] w-[70px]'
            ref={footholderRefs.current[i]}
          >
            <Image
              src='/footholder.svg'
              alt='footholder'
              fill
              className='object-contain'
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default JumpingAnimation;
