import { useEffect, useMemo, useRef, useState } from 'react';

import {
  BOARD_CONFIG,
  UserCharacter,
} from '@/components/game-room/boardMap/GameBoard';
import { ParticipantInfo } from '@/stores/websocket/useGameParticipantStore';
import { PlayingGameScore } from '@/stores/websocket/useScoreStore';
import {
  calculateMovingPosition,
  calculateStaticPosition,
} from '@/utils/boardMap/calculatePosition';
import { createInitialCharacters } from '@/utils/boardMap/createInitialCharacters';
import { getCharacterSize } from '@/utils/boardMap/getCharacterSize';

import { LayoutSize } from './useBoardLayoutSize';

export interface AnimationConfig {
  speed: number;
  range: number;
  moveDuration: number;
}

type CharacterDOMPart = 'container' | 'name' | 'image';

export const useBoardAnimation = (
  animationConfig: AnimationConfig,
  layoutSize: LayoutSize,
) => {
  const charactersRef = useRef<UserCharacter[]>([]);
  const characterDOMRefs = useRef<
    Record<string, Partial<Record<CharacterDOMPart, HTMLDivElement | null>>>
  >({});
  const prevBoardInfoRef = useRef<Record<string, number>>({});

  const animationTimeRef = useRef(0);
  const prevTimestampRef = useRef(0);

  const [, forceUpdate] = useState(0);

  const { charWidth, charHeight, leftSectionWidth } = useMemo(
    () => getCharacterSize(layoutSize.paddedWidth, BOARD_CONFIG),
    [layoutSize],
  );

  const getCharacters = () => charactersRef.current;

  const initializeCharacters = (participants: ParticipantInfo[]) => {
    charactersRef.current = createInitialCharacters(participants);
  };

  const registerCharacterDOM =
    (name: string, part: CharacterDOMPart) => (el: HTMLDivElement | null) => {
      if (!characterDOMRefs.current[name]) {
        characterDOMRefs.current[name] = {};
      }
      characterDOMRefs.current[name]![part] = el;
    };

  const shouldUpdateBoard = (scores: PlayingGameScore): boolean => {
    for (const name in scores) {
      if (prevBoardInfoRef.current[name] !== scores[name]) {
        prevBoardInfoRef.current = { ...scores };
        return true;
      }
    }

    return false;
  };

  const updateCharactersWithScores = (
    onCharacterMoved: () => void,
    scores: PlayingGameScore,
  ) => {
    charactersRef.current = charactersRef.current.map(character => {
      const toPosition = scores[character.name];
      if (toPosition !== undefined) {
        if (character.position !== toPosition) {
          onCharacterMoved();
        }
        return {
          ...character,
          fromPosition: character.position,
          toPosition,
          isMoving: character.position !== toPosition,
          moveProgress: 0,
          moveStartTime: performance.now(),
        };
      }
      return character;
    });
  };

  // 애니메이션 (DOM 위치 갱신 및 상태 업데이트)
  useEffect(() => {
    let animationId: number;

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - prevTimestampRef.current;
      prevTimestampRef.current = timestamp;
      animationTimeRef.current += deltaTime;

      let isEndMoving = false;
      charactersRef.current.forEach((char, index) => {
        const el = characterDOMRefs.current[char.name];
        if (!el) return;

        const container = el.container;
        const name = el.name;
        const image = el.image;

        const phaseOffset = index * 0.5;
        const newOffset =
          Math.sin(
            (animationTimeRef.current / 1000) * animationConfig.speed +
              phaseOffset,
          ) * animationConfig.range;
        char.animationOffset = newOffset;
        if (container) container.style.transform = `translateY(${newOffset}px)`;

        let x = 0,
          y = 0;

        if (char.isMoving) {
          const moveElapsed = timestamp - char.moveStartTime;
          const progress = Math.min(
            moveElapsed / animationConfig.moveDuration,
            1,
          );

          char.moveProgress = progress;

          const position = calculateMovingPosition(
            char,
            layoutSize,
            leftSectionWidth,
          );
          x = position?.x || 0;
          y = position?.y || 0;

          if (progress >= 1) {
            char.isMoving = false;
            char.position = char.toPosition;
            char.fromPosition = char.toPosition;

            isEndMoving = true;
          }
        } else {
          const position = calculateStaticPosition(
            char,
            layoutSize,
            leftSectionWidth,
          );

          x = position?.x;
          y = position?.y;
        }

        // // 캐릭터 위치
        const characterX = x - charWidth / 2 - 55;
        const characterY = y - charHeight - BOARD_CONFIG.yOffset;

        // // 캐릭터 닉네임 위치
        const nameX = x - 10;
        const nameY = y - charHeight - 30 - BOARD_CONFIG.yOffset;

        char.x = characterX;
        char.y = characterY;
        char.nameX = nameX;
        char.nameY = nameY;

        if (name) {
          name.style.left = `${nameX}px`;
          name.style.top = `${nameY}px`;
        }

        if (image) {
          image.style.left = `${characterX}px`;
          image.style.top = `${characterY}px`;
        }
      });

      if (isEndMoving) forceUpdate(n => n + 1);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [layoutSize]);

  return {
    getCharacters,
    initializeCharacters,
    registerCharacterDOM,
    shouldUpdateBoard,
    updateCharactersWithScores,
  };
};
