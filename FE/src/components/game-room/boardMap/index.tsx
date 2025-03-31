import { useEffect, useRef, useState } from 'react';

import { useGameBubbleStore } from '@/stores/websocket/useGameBubbleStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useScoreStore } from '@/stores/websocket/useScoreStore';

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

const GameBoardMap = () => {
  const { scores } = useScoreStore();
  const { targetUser, triggerUser, eventType } = useGameBubbleStore();
  const { participantInfo } = useParticipantInfoStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
  }, [targetUser, triggerUser, eventType]);

  const [animationTime, setAnimationTime] = useState(0);
  const animationSpeed = 5;
  const animationRange = 5;
  const moveAnimationDuration = 200;

  const animationInProgressRef = useRef(false);
  const prevBoardInfoRef = useRef<Record<string, number>>({});

  const footholderRatios: FootholderPosition[] = [
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

  // boardInfo가 변경될 때 캐릭터 이동 처리
  useEffect(() => {
    // boardInfo가 비어있으면 처리하지 않음
    if (Object.keys(scores).length === 0) return;

    // 이전 boardInfo와 현재 boardInfo가 같으면 처리하지 않음
    const isSameBoardInfo = Object.entries(scores).every(
      ([name, position]) => prevBoardInfoRef.current[name] === position,
    );
    if (isSameBoardInfo) return;

    // 현재 boardInfo 저장
    prevBoardInfoRef.current = { ...scores };

    const now = performance.now();

    // 애니메이션 진행 중인 캐릭터의 정보를 큐에 담는 접근법
    setCharacters(prevCharacters => {
      return prevCharacters.map(character => {
        // 각 캐릭터에 대해 무조건 처리 (name in boardInfo 대신)
        const toPosition = scores[character.name];

        // boardInfo에 해당 캐릭터 정보가 있고 위치가 다른 경우에만 이동
        if (toPosition !== undefined && character.position !== toPosition) {
          // 이미 이동 중인 경우 곧바로 새 위치로 이동
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
            // 이동 중이 아닐 때만 새 애니메이션 시작
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
      });
    });
  }, [scores]);

  // 참가자 정보가 로드되면 캐릭터 초기화
  useEffect(() => {
    if (participantInfo.length > 0) {
      const now = performance.now();
      const initialCharacters = participantInfo.map(participant => ({
        name: participant.userName,
        position: 0, // 초기 위치
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

  // 애니메이션 루프
  useEffect(() => {
    let animationId: number;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      setAnimationTime(prev => prev + deltaTime);

      // 둥실거리는 애니메이션과 이동 애니메이션 처리
      setCharacters(prevCharacters => {
        let anyCharacterMoving = false;

        const updatedCharacters = prevCharacters.map((character, index) => {
          // 둥실거리는 애니메이션 (숨쉬는 효과)
          const phaseOffset = index * 0.5;
          const newOffset =
            Math.sin((animationTime / 1000) * animationSpeed + phaseOffset) *
            animationRange;

          let updatedCharacter = {
            ...character,
            animationOffset: newOffset,
          };

          // 이동 애니메이션 처리
          if (character.isMoving) {
            const moveElapsed = timestamp - character.moveStartTime;
            const progress = Math.min(moveElapsed / moveAnimationDuration, 1);

            anyCharacterMoving = anyCharacterMoving || progress < 1;

            updatedCharacter = {
              ...updatedCharacter,
              moveProgress: progress,
            };

            // 애니메이션 완료 시 상태 업데이트
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

        // 애니메이션 상태 업데이트
        animationInProgressRef.current = anyCharacterMoving;

        return updatedCharacters;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [animationTime]);

  // 위치 보간 함수 - 부드러운 이동 및 점프 효과 계산
  const interpolatePosition = (
    fromPos: FootholderPosition,
    toPos: FootholderPosition,
    progress: number,
    leftSectionWidth: number,
    windowHeight: number,
  ) => {
    // 이징 함수 적용 (ease-in-out)
    const easedT =
      progress < 0.5
        ? 2 * progress * progress // ease-in
        : 1 - Math.pow(-2 * progress + 2, 2) / 2; // ease-out

    // 시작점과 끝점 좌표 계산
    const fromX = fromPos.xRatio * leftSectionWidth;
    const fromY = fromPos.yRatio * windowHeight;
    const toX = toPos.xRatio * leftSectionWidth;
    const toY = toPos.yRatio * windowHeight;

    // 선형 보간
    const x = fromX + (toX - fromX) * easedT;
    let y = fromY + (toY - fromY) * easedT;

    // 점프 효과 - 사인 함수로 부드러운 아치형 궤적 생성
    const jumpHeight = 30 * Math.sin(Math.PI * easedT);
    y -= jumpHeight;

    return { x, y };
  };

  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        로딩 중...
      </div>
    );
  }

  // 강제 리렌더링용 키 생성 - 말풍선 업데이트를 보장하기 위함
  const renderKey = `${targetUser}-${triggerUser}-${eventType}`;

  return (
    <div
      key={renderKey}
      className='absolute top-0 left-0 h-full w-full overflow-hidden'
    >
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
        const leftSectionWidth = windowSize.width * 0.75;
        const baseSize = Math.min(48, leftSectionWidth * 0.08);
        const charWidth = baseSize * 1.5;
        const charHeight = charWidth * 1.25;
        const characterYOffset = 20;

        let x = 0;
        let y = 0;

        if (character.isMoving) {
          const fromPosition = footholderRatios[character.fromPosition];
          const toPosition = footholderRatios[character.toPosition];

          if (fromPosition && toPosition) {
            // 부드러운 이동 및 점프 효과 계산
            const pos = interpolatePosition(
              fromPosition,
              toPosition,
              character.moveProgress,
              leftSectionWidth,
              windowSize.height,
            );

            x = pos.x;
            y = pos.y;
          }
        } else {
          const position = footholderRatios[character.position];
          if (position) {
            x = position.xRatio * leftSectionWidth;
            y = position.yRatio * windowSize.height;
          }
        }

        const characterX = x - charWidth / 2 - 10;
        const characterY = y - charHeight - characterYOffset;

        const nameX = x;
        const nameY = y - charHeight - 30 - characterYOffset;

        const bubbleWidth = charWidth * 0.8;
        const bubbleHeight = bubbleWidth * 0.8;

        const rightBubbleX = x + charWidth / 2 + 5;
        const rightBubbleY = y - charHeight - characterYOffset;

        const leftBubbleX = x - charWidth / 2 - bubbleWidth + 5;
        const leftBubbleY = y - charHeight - characterYOffset;

        const characterRenderKey = `char-${charIndex}-${character.name === targetUser}-${character.name === triggerUser}`;

        return (
          <div
            key={characterRenderKey}
            className='absolute'
            style={{
              transform: `translateY(${character.animationOffset}px)`,
              zIndex: 10,
              willChange: 'transform', // 브라우저에게 변환을 미리 준비하도록 힌트 제공
              opacity: 1, // 항상 보이도록 설정
            }}
          >
            {/* 캐릭터 이름 */}
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

            {/* 대상 사용자 버블 (오른쪽) - 조건식 단순화 */}
            {character.name === targetUser && (
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

            {/* 트리거 사용자 버블 (왼쪽) - 조건식 단순화 */}
            {character.name === triggerUser && (
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

export default GameBoardMap;
