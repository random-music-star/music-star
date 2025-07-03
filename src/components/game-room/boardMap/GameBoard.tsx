import { useEffect, useRef, useState } from 'react';

import { footholderRatios } from '@/constants/boardMap/footholderRatios';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useSoundEventStore } from '@/stores/useSoundEventStore';
import { useGameBubbleStore } from '@/stores/websocket/useGameBubbleStore';
import { useGameDiceStore } from '@/stores/websocket/useGameDiceStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useScoreStore } from '@/stores/websocket/useScoreStore';
import { createInitialCharacters } from '@/utils/boardMap/createInitialCharacters';
import { interpolatePosition } from '@/utils/boardMap/interpolatePosition';

import EventOverlay from './EventOverlay';
import Footholders from './Footholders';
import Bubble from './bubble';

export interface FootholderPosition {
  xRatio: number;
  yRatio: number;
  size?: number;
}

export interface UserCharacter {
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

const GameBoard = () => {
  const { scores } = useScoreStore();
  const { targetUser, triggerUser, eventType } = useGameBubbleStore();
  const { participantInfo } = useParticipantInfoStore();
  const { setSoundEvent } = useSoundEventStore();
  const { isActiveDice } = useGameDiceStore();

  const { windowSize } = useWindowSize();

  const [isLoading, setIsLoading] = useState(true);
  const [characters, setCharacters] = useState<UserCharacter[]>([]);

  const [animationTime, setAnimationTime] = useState(0);
  const animationSpeed = 5;
  const animationRange = 5;
  const moveAnimationDuration = 200;

  const animationInProgressRef = useRef(false);
  const prevBoardInfoRef = useRef<Record<string, number>>({});

  // 플레이어 초기화
  useEffect(() => {
    if (participantInfo.length > 0) {
      const initialCharacters = createInitialCharacters(participantInfo);

      setCharacters(initialCharacters);
      setIsLoading(false);
    }
  }, [participantInfo]);

  // 실시간 이동 여부 체크
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

  // 애니메이션 구현
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

  if (isLoading) {
    return <div className='loading-screen'>로딩 중...</div>;
  }

  const renderKey = `${targetUser}-${triggerUser}-${eventType}`;

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
      {/* 이벤트 */}
      {eventType && <EventOverlay eventType={eventType} />}

      {/* 발판 */}
      <Footholders
        paddedWidth={paddedWidth}
        paddedHeight={paddedHeight}
        padding={padding}
      />

      {/* 캐릭터 */}
      {characters.map((character, index) => {
        const leftSectionWidth = paddedWidth * 0.75;
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
              paddedHeight,
            );
            x = padding + pos.x;
            y = padding + pos.y;
          }
        } else {
          const pos = footholderRatios[character.position];
          if (pos) {
            x = padding + pos.xRatio * leftSectionWidth;
            y = padding + pos.yRatio * paddedHeight;
          }
        }

        // 캐릭터 위치
        const characterX = x - charWidth / 2 - 55;
        const characterY = y - charHeight - characterYOffset;

        // 캐릭터 닉네임 위치
        const nameX = x - 10;
        const nameY = y - charHeight - 30 - characterYOffset;

        const characterRenderKey = `char-${index}-${character.name}`;

        return (
          <div
            key={characterRenderKey}
            className='character'
            style={{ transform: `translateY(${character.animationOffset}px)` }}
          >
            <Bubble
              isActiveDice={isActiveDice}
              character={character}
              charWidth={charWidth}
              characterX={characterX}
              characterY={characterY}
            />

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
