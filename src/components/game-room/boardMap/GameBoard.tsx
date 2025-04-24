import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/utils';
import { useSoundEventStore } from '@/stores/useSoundEventStore';
import {
  EventType,
  useGameBubbleStore,
} from '@/stores/websocket/useGameBubbleStore';
import { useGameDiceStore } from '@/stores/websocket/useGameDiceStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useScoreStore } from '@/stores/websocket/useScoreStore';

import EventCard from './EventCard';

interface FootholderPosition {
  xRatio: number;
  yRatio: number;
  size?: number;
}

interface UserCharacter {
  name: string;
  position: number;
  imageSrc: string;
  animationOffset: number;
  isMoving: boolean;
  fromPosition: number;
  toPosition: number;
  moveProgress: number;
  moveStartTime: number;
}

// 테두리에 50px 패딩을 적용하고 좌우 대칭을 맞춘 footholderRatios
const footholderRatios: FootholderPosition[] = [
  { xRatio: 0.1, yRatio: 0.88, size: 2 }, // 0번 위치
  { xRatio: 0.23, yRatio: 0.86, size: 1.5 }, // 1번 위치
  { xRatio: 0.36, yRatio: 0.83, size: 1.5 }, // 2번 위치
  { xRatio: 0.49, yRatio: 0.79, size: 1.5 }, // 3번 위치
  { xRatio: 0.62, yRatio: 0.75, size: 1.5 }, // 4번 위치
  { xRatio: 0.75, yRatio: 0.71, size: 1.5 }, // 5번 위치
  { xRatio: 0.88, yRatio: 0.67, size: 1.5 }, // 6번 위치
  { xRatio: 0.88, yRatio: 0.52, size: 1.5 }, // 7번 위치
  { xRatio: 0.75, yRatio: 0.55, size: 1.5 }, // 8번 위치
  { xRatio: 0.62, yRatio: 0.53, size: 1.5 }, // 9번 위치
  { xRatio: 0.49, yRatio: 0.51, size: 1.5 }, // 10번 위치
  { xRatio: 0.36, yRatio: 0.53, size: 1.5 }, // 11번 위치
  { xRatio: 0.23, yRatio: 0.55, size: 1.5 }, // 12번 위치
  { xRatio: 0.1, yRatio: 0.52, size: 1.5 }, // 13번 위치
  { xRatio: 0.1, yRatio: 0.35, size: 1.5 }, // 14번 위치
  { xRatio: 0.23, yRatio: 0.32, size: 1.5 }, // 15번 위치
  { xRatio: 0.36, yRatio: 0.29, size: 1.5 }, // 16번 위치
  { xRatio: 0.49, yRatio: 0.25, size: 1.5 }, // 17번 위치
  { xRatio: 0.62, yRatio: 0.22, size: 1.5 }, // 18번 위치
  { xRatio: 0.75, yRatio: 0.19, size: 1.5 }, // 19번 위치
  { xRatio: 0.88, yRatio: 0.16, size: 2 }, // 20번 위치
];

// bubble.svg를 사용할 발판 번호 목록
const bubbleRightMap: Record<number, boolean> = {
  0: true,
  1: true,
  2: true,
  10: true,
  11: true,
  12: true,
  13: true,
  14: true,
  15: true,
  16: true,
  17: true,
};

const EventOverlay = ({ eventType }: { eventType: EventType }) => {
  return (
    <div className='event-overlay'>
      <div
        className={cn('flip-card-container w-full', {
          'animate-scale-in animate-flip': eventType !== 'MARK',
          'animate-scale-in': eventType === 'MARK',
        })}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className='flip-card-front'
          style={{ backfaceVisibility: 'hidden' }}
        >
          <EventCard eventType={'MARK'} />
        </div>

        <div
          className='flip-card-back'
          style={{ backfaceVisibility: 'hidden' }}
        >
          <EventCard eventType={eventType} />
        </div>
      </div>
    </div>
  );
};

const BubbleContent = ({ isActive }: { isActive: boolean }) => {
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

const GameBoard = () => {
  const { scores } = useScoreStore();
  const { targetUser, triggerUser, eventType } = useGameBubbleStore();
  const { participantInfo } = useParticipantInfoStore();
  const { setSoundEvent } = useSoundEventStore();
  const { isActiveDice, diceUsername } = useGameDiceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [characters, setCharacters] = useState<UserCharacter[]>([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  const currentTargetUserRef = useRef(targetUser);
  const currentTriggerUserRef = useRef(triggerUser);

  useEffect(() => {
    currentTargetUserRef.current = targetUser;
    currentTriggerUserRef.current = triggerUser;
  }, [targetUser, triggerUser]);

  const [animationTime, setAnimationTime] = useState(0);
  const animationSpeed = 5;
  const animationRange = 5;
  const moveAnimationDuration = 200;

  const animationInProgressRef = useRef(false);
  const prevBoardInfoRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (Object.keys(scores).length === 0) return;
    const isSameBoardInfo = Object.entries(scores).every(
      ([name, pos]) => prevBoardInfoRef.current[name] === pos,
    );
    if (isSameBoardInfo) return;
    prevBoardInfoRef.current = { ...scores };
    const now = performance.now();
    setCharacters(prevChars =>
      prevChars.map(character => {
        setSoundEvent('JUMP');
        const toPosition = scores[character.name];
        if (toPosition !== undefined && character.position !== toPosition) {
          if (character.isMoving) {
            return {
              ...character,
              position: toPosition,
              fromPosition: toPosition,
              toPosition: toPosition,
              isMoving: false,
              moveProgress: 1,
            };
          } else {
            return {
              ...character,
              fromPosition: character.position,
              toPosition,
              isMoving: true,
              moveProgress: 0,
              moveStartTime: now,
            };
          }
        }
        return character;
      }),
    );
  }, [scores]);

  useEffect(() => {
    if (participantInfo.length > 0) {
      const now = performance.now();
      const initialCharacters = participantInfo.map(participant => ({
        name: participant.userName,
        position: 0,
        imageSrc: participant.character,
        animationOffset: 0,
        isMoving: false,
        fromPosition: 0,
        toPosition: 0,
        moveProgress: 0,
        moveStartTime: now,
      }));
      setCharacters(initialCharacters);
      setIsLoading(false);
    }
  }, [participantInfo]);

  useEffect(() => {
    let animationId: number;
    let lastTimestamp = 0;
    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      setAnimationTime(prev => prev + deltaTime);
      setCharacters(prevChars => {
        let anyMoving = false;
        const updated = prevChars.map((char, index) => {
          const phaseOffset = index * 0.5;
          const newOffset =
            Math.sin((animationTime / 1000) * animationSpeed + phaseOffset) *
            animationRange;
          let updatedChar = { ...char, animationOffset: newOffset };
          if (char.isMoving) {
            const moveElapsed = timestamp - char.moveStartTime;
            const progress = Math.min(moveElapsed / moveAnimationDuration, 1);
            anyMoving = anyMoving || progress < 1;
            updatedChar = { ...updatedChar, moveProgress: progress };
            if (progress >= 1) {
              updatedChar = {
                ...updatedChar,
                isMoving: false,
                position: updatedChar.toPosition,
                fromPosition: updatedChar.toPosition,
              };
            }
          }
          return updatedChar;
        });
        animationInProgressRef.current = anyMoving;
        return updated;
      });
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [animationTime]);

  const interpolatePosition = (
    fromPos: FootholderPosition,
    toPos: FootholderPosition,
    progress: number,
    leftSectionWidth: number,
    windowHeight: number,
  ) => {
    const easedT =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const fromX = fromPos.xRatio * leftSectionWidth;
    const fromY = fromPos.yRatio * windowHeight;
    const toX = toPos.xRatio * leftSectionWidth;
    const toY = toPos.yRatio * windowHeight;
    const x = fromX + (toX - fromX) * easedT;
    let y = fromY + (toY - fromY) * easedT;
    const jumpHeight = 30 * Math.sin(Math.PI * easedT);
    y -= jumpHeight;
    return { x, y };
  };

  if (isLoading) {
    return <div className='loading-screen'>로딩 중...</div>;
  }

  const renderKey = `${targetUser}-${triggerUser}-${eventType}`;

  // 화면 테두리에 패딩 적용
  const padding = 50;
  const paddedWidth = windowSize.width - padding * 2;
  const paddedHeight = windowSize.height - padding * 2;

  return (
    <div
      key={renderKey}
      className='game-board'
      style={{
        padding: `${padding}px`,
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
      }}
    >
      {eventType && <EventOverlay eventType={eventType} />}
      {footholderRatios.map((position, index) => {
        const leftSectionWidth = paddedWidth * 0.75; // 패딩이 적용된 너비
        const baseSize = Math.min(48, leftSectionWidth * 0.08);
        const size = baseSize * (position.size || 1.5);
        const x = padding + position.xRatio * leftSectionWidth;
        const y = padding + position.yRatio * paddedHeight;
        return (
          <div
            key={`footholder-${index}`}
            className='footholder'
            style={{
              position: 'absolute',
              left: `${x - size / 2}px`,
              top: `${y - size / 2}px`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundImage: 'url(/footholder.svg)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
        );
      })}

      {/* 캐릭터 렌더링 */}
      {characters.map((character, index) => {
        const leftSectionWidth = paddedWidth * 0.75; // 패딩이 적용된 너비
        const baseSize = Math.min(48, leftSectionWidth * 0.08);
        const charWidth = baseSize * 1.5;
        const charHeight = charWidth * 1.25;
        const characterYOffset = 55;
        let x = 0,
          y = 0;
        if (character.isMoving) {
          const fromPos = footholderRatios[character.fromPosition];
          const toPos = footholderRatios[character.toPosition];
          if (fromPos && toPos) {
            const pos = interpolatePosition(
              fromPos,
              toPos,
              character.moveProgress,
              leftSectionWidth,
              paddedHeight, // 패딩이 적용된 높이
            );
            x = padding + pos.x; // 패딩 적용
            y = padding + pos.y; // 패딩 적용
          }
        } else {
          const pos = footholderRatios[character.position];
          if (pos) {
            x = padding + pos.xRatio * leftSectionWidth; // 패딩 적용
            y = padding + pos.yRatio * paddedHeight; // 패딩 적용
          }
        }

        // 원본 코드 계산 방식을 정확히 유지
        const characterX = x - charWidth / 2 - 55; // 원본 계산 방식 유지
        const characterY = y - charHeight - characterYOffset; // 원본 계산 방식 유지

        // 캐릭터 이름도 원본 계산 방식 유지
        const nameX = x - 10;
        const nameY = y - charHeight - 30 - characterYOffset;

        const characterRenderKey = `char-${index}-${character.name}`;

        const isLeftSide = bubbleRightMap[character.position] || false;
        const bubbleImage = isLeftSide ? '/bubble.svg' : '/bubble_left.svg';

        const bubbleSize = charWidth * 2;

        // 말풍선 위치 조정 - 원본 접근법 유지
        const bubbleX = characterX - bubbleSize + 20;
        const bubbleY = characterY - bubbleSize + 20 + character.position / 2;

        const isCurrentPlayer = character.name === diceUsername;

        return (
          <div
            key={characterRenderKey}
            className='character'
            style={{ transform: `translateY(${character.animationOffset}px)` }}
          >
            {/* 말풍선 표시 */}
            <div
              className='bubble'
              style={{
                position: 'absolute',
                left: isLeftSide ? `${bubbleX + 210}px` : `${bubbleX}px`,
                top: `${bubbleY}px`,
                width: `${bubbleSize}px`,
                height: `${bubbleSize}px`,
                backgroundImage: `url(${bubbleImage})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                zIndex: 10,
                opacity: isActiveDice && isCurrentPlayer ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
              }}
            >
              {/* 말풍선 내부 이동 숫자 애니메이션 */}
              <BubbleContent isActive={isActiveDice && isCurrentPlayer} />
            </div>

            <div
              className='character-name'
              style={{
                position: 'absolute',
                left: `${nameX}px`,
                top: `${nameY}px`,
                textAlign: 'center',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              {character.name}
            </div>
            <div
              className='character-image'
              style={{
                position: 'absolute',
                left: `${characterX}px`,
                top: `${characterY}px`,
                width: `${charWidth}px`,
                height: `${charHeight}px`,
                backgroundImage: `url(${character.imageSrc})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
