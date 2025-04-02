// GameBoardMap.jsx
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import {
  EventType,
  useGameBubbleStore,
} from '@/stores/websocket/useGameBubbleStore';
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

const footholderRatios: FootholderPosition[] = [
  { xRatio: 0.08, yRatio: 0.92, size: 2 },
  { xRatio: 0.22, yRatio: 0.9, size: 1.5 },
  { xRatio: 0.36, yRatio: 0.85, size: 1.5 },
  { xRatio: 0.5, yRatio: 0.8, size: 1.5 },
  { xRatio: 0.64, yRatio: 0.75, size: 1.5 },
  { xRatio: 0.78, yRatio: 0.7, size: 1.5 },
  { xRatio: 0.92, yRatio: 0.65, size: 1.5 },
  { xRatio: 0.87, yRatio: 0.49, size: 1.5 },
  { xRatio: 0.72, yRatio: 0.54, size: 1.5 },
  { xRatio: 0.57, yRatio: 0.51, size: 1.5 },
  { xRatio: 0.42, yRatio: 0.5, size: 1.5 },
  { xRatio: 0.27, yRatio: 0.52, size: 1.5 },
  { xRatio: 0.12, yRatio: 0.48, size: 1.5 },
  { xRatio: 0.08, yRatio: 0.3, size: 1.5 },
  { xRatio: 0.22, yRatio: 0.27, size: 1.5 },
  { xRatio: 0.36, yRatio: 0.24, size: 1.5 },
  { xRatio: 0.5, yRatio: 0.21, size: 1.5 },
  { xRatio: 0.64, yRatio: 0.18, size: 1.5 },
  { xRatio: 0.78, yRatio: 0.16, size: 1.5 },
  { xRatio: 0.92, yRatio: 0.14, size: 2 },
];

const EventOverlay = ({ eventType }: { eventType: EventType }) => {
  const [visible, setVisible] = useState(false);
  const mountedRef = useRef(false);
  const eventTypeRef = useRef<EventType | null>(null);

  useEffect(() => {
    eventTypeRef.current = eventType;

    if (mountedRef.current) {
      setVisible(false);
      setTimeout(() => {
        setVisible(true);
      }, 100);
    } else {
      mountedRef.current = true;
      setVisible(true);
    }

    const timer = setTimeout(
      () => {
        setVisible(false);
      },
      eventType === 'MARK' ? 1500 : 2000,
    );

    return () => clearTimeout(timer);
  }, [eventType]);

  if (!visible || !eventType) return null;

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

const GameBoardMap = () => {
  const { scores } = useScoreStore();
  const { targetUser, triggerUser, eventType } = useGameBubbleStore();
  const { participantInfo } = useParticipantInfoStore();
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

  return (
    <div key={renderKey} className='game-board'>
      {eventType && <EventOverlay eventType={eventType} />}
      {footholderRatios.map((position, index) => {
        const leftSectionWidth = windowSize.width * 0.75;
        const baseSize = Math.min(48, leftSectionWidth * 0.08);
        const size = baseSize * (position.size || 1.5);
        const x = position.xRatio * leftSectionWidth;
        const y = position.yRatio * windowSize.height;
        return (
          <div
            key={`footholder-${index}`}
            className='footholder'
            style={{
              left: `${x - size / 2}px`,
              top: `${y - size / 2}px`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundImage: 'url(/footholder.svg)',
            }}
          />
        );
      })}

      {/* 캐릭터 렌더링 */}
      {characters.map((character, index) => {
        const leftSectionWidth = windowSize.width * 0.75;
        const baseSize = Math.min(48, leftSectionWidth * 0.08);
        const charWidth = baseSize * 1.5;
        const charHeight = charWidth * 1.25;
        const characterYOffset = 20;
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
              windowSize.height,
            );
            x = pos.x;
            y = pos.y;
          }
        } else {
          const pos = footholderRatios[character.position];
          if (pos) {
            x = pos.xRatio * leftSectionWidth;
            y = pos.yRatio * windowSize.height;
          }
        }
        const characterX = x - charWidth / 2 - 10;
        const characterY = y - charHeight - characterYOffset;
        const nameX = x;
        const nameY = y - charHeight - 30 - characterYOffset;
        const characterRenderKey = `char-${index}-${character.name}`;
        return (
          <div
            key={characterRenderKey}
            className='character'
            style={{ transform: `translateY(${character.animationOffset}px)` }}
          >
            <div
              className='character-name'
              style={{ left: `${nameX}px`, top: `${nameY}px` }}
            >
              {character.name}
            </div>
            <div
              className='character-image'
              style={{
                left: `${characterX}px`,
                top: `${characterY}px`,
                width: `${charWidth}px`,
                height: `${charHeight}px`,
                backgroundImage: `url(${character.imageSrc})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default GameBoardMap;
