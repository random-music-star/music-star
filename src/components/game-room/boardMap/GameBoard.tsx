import { useEffect, useMemo, useState } from 'react';

import { useBoardAnimation } from '@/hooks/useBoardAnimation';
import { useBoardLayoutSize } from '@/hooks/useBoardLayoutSize';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useSoundEventStore } from '@/stores/useSoundEventStore';
import { useGameBubbleStore } from '@/stores/websocket/useGameBubbleStore';
import { useGameDiceStore } from '@/stores/websocket/useGameDiceStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useScoreStore } from '@/stores/websocket/useScoreStore';
import { getCharacterSize } from '@/utils/boardMap/getCharacterSize';

import EventOverlay from './EventOverlay';
import Footholders from './Footholders';
import Bubble from './bubble';

export interface UserCharacter {
  name: string;
  position: number;
  x: number;
  y: number;
  nameX: number;
  nameY: number;
  imageSrc: string;
  animationOffset: number;
  isMoving: boolean;
  fromPosition: number;
  toPosition: number;
  moveProgress: number;
  moveStartTime: number;
}

export const BOARD_CONFIG = {
  padding: 50,
  maxCharacterSize: 48,
  widthRatio: 1.5,
  heightRatio: 1.25,
  yOffset: 55,
};
const ANIMATION_CONFIG = {
  speed: 5,
  range: 5,
  moveDuration: 200,
};

const GameBoard = () => {
  const { scores } = useScoreStore();
  const { targetUser, triggerUser, eventType } = useGameBubbleStore();
  const { participantInfo } = useParticipantInfoStore();
  const { setSoundEvent } = useSoundEventStore();
  const { isActiveDice } = useGameDiceStore();

  const { windowSize } = useWindowSize();
  const { layoutSize } = useBoardLayoutSize(windowSize, BOARD_CONFIG);

  const { charWidth, charHeight } = useMemo(
    () => getCharacterSize(layoutSize.paddedWidth, BOARD_CONFIG),
    [layoutSize],
  );

  const [isLoading, setIsLoading] = useState(true);

  const {
    getCharacters,
    initializeCharacters,
    registerCharacterDOM,
    shouldUpdateBoard,
    updateCharactersWithScores,
  } = useBoardAnimation(ANIMATION_CONFIG, layoutSize);

  // 플레이어 초기화
  useEffect(() => {
    if (participantInfo.length > 0) {
      initializeCharacters(participantInfo);

      setIsLoading(false);
    }
  }, [participantInfo]);

  // 실시간 이동 여부 체크
  useEffect(() => {
    if (!shouldUpdateBoard) return;

    updateCharactersWithScores(() => {
      setSoundEvent('JUMP');
    }, scores);
  }, [scores]);

  if (isLoading) {
    return <div className='loading-screen'>로딩 중...</div>;
  }

  const renderKey = `${targetUser}-${triggerUser}-${eventType}`;

  return (
    <div
      key={renderKey}
      className='game-board'
      style={{
        padding: `${BOARD_CONFIG.padding}px`,
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
        paddedWidth={layoutSize.paddedWidth}
        paddedHeight={layoutSize.paddedHeight}
        padding={BOARD_CONFIG.padding}
      />

      {/* 캐릭터 */}
      {getCharacters().map((character, index) => {
        return (
          <div
            key={`char-${index}-${character.name}`}
            className='character'
            ref={registerCharacterDOM(character.name, 'container')}
          >
            <Bubble
              isActiveDice={isActiveDice}
              character={character}
              charWidth={charWidth}
            />

            <div
              className='character-name absolute -translate-x-1/2 text-center whitespace-nowrap'
              ref={registerCharacterDOM(character.name, 'name')}
              style={{
                left: `${character.nameX}px`,
                top: `${character.nameY}px`,
              }}
            >
              {character.name}
            </div>
            <div
              className='character-image absolute bg-contain bg-center bg-no-repeat'
              ref={registerCharacterDOM(character.name, 'image')}
              style={{
                left: `${character.x}px`,
                top: `${character.y}px`,
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

export default GameBoard;
