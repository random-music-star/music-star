import { useEffect, useState } from 'react';

import { useGameBoardInfoStore } from '@/stores/websocket/useGameBoardInfoStore';
import { useGameBubbleStore } from '@/stores/websocket/useGameBubbleStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';

interface FootholderPosition {
  xRatio: number;
  yRatio: number;
  size?: number;
}

interface UserCharacter {
  name: string;
  position: number; // 발판 인덱스
  imageSrc: string; // 캐릭터 이미지 경로
  animationOffset: number;
  // 캐릭터 이동 애니메이션을 위한 추가 속성
  isMoving: boolean;
  fromPosition: number;
  toPosition: number;
  moveProgress: number; // 0(시작 위치)에서 1(목표 위치)까지의 진행도
}

const GameBoard = () => {
  const { boardInfo } = useGameBoardInfoStore();
  const { targetUser, triggerUser, eventType } = useGameBubbleStore();
  const { participantInfo } = useParticipantInfoStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [characters, setCharacters] = useState<UserCharacter[]>([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // 애니메이션 상태 관리
  const [animationTime, setAnimationTime] = useState(0);
  const animationSpeed = 5; // 애니메이션 속도 조절 (높을수록 빠름)
  const animationRange = 10; // 애니메이션 이동 범위 (픽셀)
  const moveAnimationDuration = 250; // 이동 애니메이션 시간 (밀리초)
  const [moveStartTime, setMoveStartTime] = useState(0);

  // 발판 위치를 비율로 정의 (0~1 사이의 값)
  const footholderRatios: FootholderPosition[] = [
    // 하단 행 (왼쪽에서 오른쪽으로) - 0~6
    { xRatio: 0.08, yRatio: 0.92, size: 2 }, // 0
    { xRatio: 0.22, yRatio: 0.9, size: 1.5 }, // 1
    { xRatio: 0.36, yRatio: 0.85, size: 1.5 }, // 2
    { xRatio: 0.5, yRatio: 0.8, size: 1.5 }, // 3
    { xRatio: 0.64, yRatio: 0.75, size: 1.5 }, // 4
    { xRatio: 0.78, yRatio: 0.7, size: 1.5 }, // 5
    { xRatio: 0.92, yRatio: 0.65, size: 1.5 }, // 6

    // 중간 행
    { xRatio: 0.87, yRatio: 0.49, size: 1.5 }, // 7
    { xRatio: 0.72, yRatio: 0.54, size: 1.5 }, // 8
    { xRatio: 0.57, yRatio: 0.51, size: 1.5 }, // 9
    { xRatio: 0.42, yRatio: 0.5, size: 1.5 }, // 10
    { xRatio: 0.27, yRatio: 0.52, size: 1.5 }, // 11
    { xRatio: 0.12, yRatio: 0.48, size: 1.5 }, // 12

    // 상단 행 (왼쪽에서 오른쪽으로) - 13~19
    { xRatio: 0.08, yRatio: 0.3, size: 1.5 }, // 13
    { xRatio: 0.22, yRatio: 0.27, size: 1.5 }, // 14
    { xRatio: 0.36, yRatio: 0.24, size: 1.5 }, // 15
    { xRatio: 0.5, yRatio: 0.21, size: 1.5 }, // 16
    { xRatio: 0.64, yRatio: 0.18, size: 1.5 }, // 17
    { xRatio: 0.78, yRatio: 0.16, size: 1.5 }, // 18
    { xRatio: 0.92, yRatio: 0.14, size: 2 }, // 19
  ];

  // 윈도우 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기화 시 한 번 호출

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 캐릭터 이동 처리
  const moveBoard = () => {
    setCharacters(prevCharacters => {
      return prevCharacters.map(character => {
        const toPosition = boardInfo[character.name];
        if (character.position !== toPosition) {
          return {
            ...character,
            fromPosition: character.position,
            toPosition,
            isMoving: true,
            moveProgress: 0,
          };
        }
        return character;
      });
    });

    // 이동 시작 시간 기록
    setMoveStartTime(performance.now());
  };

  useEffect(() => {
    // 이동
    if (Object.keys(boardInfo).length > 0) {
      moveBoard();
    }
  }, [boardInfo]);

  // 캐릭터 초기화
  useEffect(() => {
    if (participantInfo.length > 0) {
      const initialCharacters = participantInfo.map(participant => ({
        name: participant.userName,
        position: 0, // 초기 위치
        imageSrc: participant.character,
        animationOffset: 0,
        isMoving: false,
        fromPosition: 0,
        toPosition: 0,
        moveProgress: 0,
      }));

      setCharacters(initialCharacters);
      setIsLoading(false);
    }
  }, [participantInfo]);

  // 애니메이션 효과
  useEffect(() => {
    let animationId: number;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaTime = timestamp - lastTimestamp;
      setAnimationTime(prev => prev + deltaTime);

      // 캐릭터 애니메이션 업데이트
      setCharacters(prevCharacters => {
        return prevCharacters.map((character, index) => {
          const phaseOffset = index * 0.5;
          const newOffset =
            Math.sin((animationTime / 1000) * animationSpeed + phaseOffset) *
            animationRange;

          let updatedCharacter = {
            ...character,
            animationOffset: newOffset,
          };

          // 이동 중인 캐릭터의 이동 진행도 업데이트
          if (character.isMoving) {
            const moveElapsed = timestamp - moveStartTime;
            const progress = Math.min(moveElapsed / moveAnimationDuration, 1);

            updatedCharacter = {
              ...updatedCharacter,
              moveProgress: progress,
            };

            // 이동 완료 시 상태 업데이트
            if (progress >= 1) {
              updatedCharacter = {
                ...updatedCharacter,
                isMoving: false,
                position: updatedCharacter.toPosition,
                fromPosition: updatedCharacter.toPosition,
              };
            }
          }

          return updatedCharacter;
        });
      });

      lastTimestamp = timestamp;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [animationTime, moveStartTime]);

  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        로딩 중...
      </div>
    );
  }
  return (
    <div className='absolute top-0 left-0 h-full w-full overflow-hidden'>
      {/* 발판 렌더링 */}
      {footholderRatios.map((position, index) => {
        const leftSectionWidth = windowSize.width * 0.75;
        const baseSize = Math.min(48, leftSectionWidth * 0.08);
        const size = baseSize * (position.size || 1.5);
        const x = position.xRatio * leftSectionWidth;
        const y = position.yRatio * windowSize.height;

        return (
          <div
            key={`footholder-${index}`}
            className='absolute bg-contain bg-center bg-no-repeat'
            style={{
              left: `${x - size / 2}px`,
              top: `${y - size / 2}px`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundImage: 'url(/footholder.svg)',
              zIndex: 1,
            }}
          />
        );
      })}

      {/* 캐릭터 렌더링 */}
      {characters.map((character, charIndex) => {
        // 캐릭터의 기본 위치를 계산 (애니메이션 오프셋 제외)
        const leftSectionWidth = windowSize.width * 0.75;
        const baseSize = Math.min(48, leftSectionWidth * 0.08);
        const charWidth = baseSize * 1.5;
        const charHeight = charWidth * 1.25;
        const characterYOffset = 20; // 발판에서 위로 올린 값

        let x = 0;
        let y = 0;

        if (character.isMoving) {
          const fromPosition = footholderRatios[character.fromPosition];
          const toPosition = footholderRatios[character.toPosition];

          if (fromPosition && toPosition) {
            const t = character.moveProgress;
            const easedT =
              t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            const fromX = fromPosition.xRatio * leftSectionWidth;
            const fromY = fromPosition.yRatio * windowSize.height;
            const toX = toPosition.xRatio * leftSectionWidth;
            const toY = toPosition.yRatio * windowSize.height;

            x = fromX + (toX - fromX) * easedT;
            y = fromY + (toY - fromY) * easedT;

            // 점프 효과
            const jumpHeight = 30 * Math.sin(Math.PI * easedT);
            y -= jumpHeight;
          }
        } else {
          const position = footholderRatios[character.position];
          if (position) {
            x = position.xRatio * leftSectionWidth;
            y = position.yRatio * windowSize.height;
          }
        }

        // 캐릭터 이미지 위치 계산
        const characterX = x - charWidth / 2 - 10;
        const characterY = y - charHeight - characterYOffset;

        // 이름 위치 계산
        const nameX = x;
        const nameY = y - charHeight - 30 - characterYOffset;

        // 말풍선 위치 계산
        const bubbleWidth = charWidth * 0.8;
        const bubbleHeight = bubbleWidth * 0.8;

        // 수정: 말풍선을 오른쪽에 배치 (+ 부호로 변경)
        const rightBubbleX = x + charWidth / 2 + 5;
        const rightBubbleY = y - charHeight - characterYOffset;

        const leftBubbleX = x - charWidth / 2 - bubbleWidth + 5;
        const leftBubbleY = y - charHeight - characterYOffset;

        return (
          <div
            key={`character-container-${charIndex}`}
            className='absolute'
            style={{
              // 중요: 전체 그룹에 애니메이션 오프셋 적용
              transform: `translateY(${character.animationOffset}px)`,
              zIndex: 10,
            }}
          >
            {/* 캐릭터 이름 - 이름을 bold 처리 */}
            <div
              className='absolute text-center text-sm font-bold whitespace-nowrap text-white'
              style={{
                left: `${nameX}px`,
                top: `${nameY}px`,
                transform: 'translateX(-50%)',
                zIndex: 12,
              }}
            >
              {character.name}
            </div>

            {/* 캐릭터 이미지 */}
            <div
              className='absolute bg-contain bg-center bg-no-repeat'
              style={{
                left: `${characterX}px`,
                top: `${characterY}px`,
                width: `${charWidth}px`,
                height: `${charHeight}px`,
                backgroundImage: `url(${character.imageSrc})`,
                zIndex: 11,
              }}
            />

            {/* 우측 말풍선 (targetUser) */}
            {targetUser === character.name && (
              <div
                className='absolute bg-contain bg-center bg-no-repeat'
                style={{
                  left: `${rightBubbleX}px`,
                  top: `${rightBubbleY}px`,
                  width: `${bubbleWidth}px`,
                  height: `${bubbleHeight}px`,
                  backgroundImage: 'url(/bubble.svg)',
                  zIndex: 13,
                }}
              >
                {/* 질문 이모지 */}
                <div
                  className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat'
                  style={{
                    width: `${bubbleWidth * 0.5}px`,
                    height: `${bubbleHeight * 0.5}px`,
                    backgroundImage: 'url(/eventemoji/question.svg)',
                  }}
                />
              </div>
            )}

            {/* 좌측 말풍선 (triggerUser) */}
            {triggerUser === character.name && (
              <div
                className='absolute bg-contain bg-center bg-no-repeat'
                style={{
                  left: `${leftBubbleX}px`,
                  top: `${leftBubbleY}px`,
                  width: `${bubbleWidth}px`,
                  height: `${bubbleHeight}px`,
                  backgroundImage: 'url(/bubble_left.svg)',
                  zIndex: 13,
                }}
              >
                {/* 이벤트 이모지 */}
                <div
                  className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat'
                  style={{
                    width: `${bubbleWidth * 0.5}px`,
                    height: `${bubbleHeight * 0.5}px`,
                    backgroundImage: `url(/eventemoji/${(eventType || 'NOTHING').toLowerCase()}.svg)`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
