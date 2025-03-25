import { useEffect, useRef, useState } from 'react';

import { useGameBoardInfoStore } from '@/stores/websocket/useGameBoardInfoStore';
import {
  EventType,
  useGameBubbleStore,
} from '@/stores/websocket/useGameBubbleStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';

interface FootholderPosition {
  xRatio: number;
  yRatio: number;
  size?: number;
}

interface UserCharacter {
  name: string;
  position: number; // 발판 인덱스
  image: HTMLImageElement | null;
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [footholderImage, setFootholderImage] =
    useState<HTMLImageElement | null>(null);
  const [bubbleImage, setBubbleImage] = useState<HTMLImageElement | null>(null);
  const [bubbleLeftImage, setBubbleLeftImage] =
    useState<HTMLImageElement | null>(null);
  const [questionImage, setQuestionImage] = useState<HTMLImageElement | null>(
    null,
  );

  // 이모지를 다중 상태로 관리
  const [emojiImages, setEmojiImages] = useState<
    Record<EventType, HTMLImageElement | null>
  >({
    MARK: null,
    PLUS: null,
    MINUS: null,
    BOMB: null,
    PULL: null,
    NOTHING: null,
    OVERLAP: null,
    CLOVER: null,
    SWAP: null,
    WARP: null,
    MAGNET: null,
  });

  const [characters, setCharacters] = useState<UserCharacter[]>([]);

  // 애니메이션 상태 관리
  const animationTimeRef = useRef<number>(0);
  const animationSpeedRef = useRef<number>(5); // 애니메이션 속도 조절 (높을수록 빠름)
  const animationRangeRef = useRef<number>(10); // 애니메이션 이동 범위 (픽셀)
  const moveAnimationDurationRef = useRef<number>(250); // 이동 애니메이션 시간 (밀리초)
  const moveStartTimeRef = useRef<number>(0);

  // 발판 위치를 비율로 정의 (0~1 사이의 값)
  // x는 3/4 영역 기준의 비율 (0: 왼쪽 끝, 1: 오른쪽 끝)
  // y는 전체 높이 기준의 비율 (0: 상단, 1: 하단)
  // size는 발판 크기 배율 (기본값 1.5)
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
    moveStartTimeRef.current = performance.now();
  };

  useEffect(() => {
    // 이동
    moveBoard();
  }, [boardInfo]);

  // 이미지 로딩
  useEffect(() => {
    const loadImages = async (): Promise<void> => {
      // 발판 이미지 로딩
      const fhImg = new Image();
      fhImg.src = '/footholder.svg';
      fhImg.onload = () => {
        setFootholderImage(fhImg);
      };

      // 말풍선 이미지 (오른쪽) 로딩
      const bubbleImg = new Image();
      bubbleImg.src = '/bubble.svg';
      bubbleImg.onload = () => {
        setBubbleImage(bubbleImg);
      };

      // 말풍선 이미지 (왼쪽) 로딩
      const bubbleLeftImg = new Image();
      bubbleLeftImg.src = '/bubble_left.svg';
      bubbleLeftImg.onload = () => {
        setBubbleLeftImage(bubbleLeftImg);
      };

      // 질문 이모지 로딩
      const qImg = new Image();
      qImg.src = '/eventemoji/question.svg';
      qImg.onload = () => {
        setQuestionImage(qImg);
      };
      qImg.onerror = () => {
        console.error('질문 이모지 이미지 로드 실패: /eventemoji/question.svg');
      };

      // 모든 이모지 타입 정의
      const emojiTypes: EventType[] = [
        'MARK',
        'PLUS',
        'MINUS',
        'BOMB',
        'PULL',
        'NOTHING',
        'OVERLAP',
        'CLOVER',
        'SWAP',
        'WARP',
        'MAGNET',
      ];

      // 모든 이모지 이미지 로딩
      const emojiImagesLoaded: Record<EventType, HTMLImageElement> =
        {} as Record<EventType, HTMLImageElement>;

      await Promise.all(
        emojiTypes.map(async type => {
          const img = new Image();
          const imagePath = `/eventemoji/${type.toLowerCase()}.svg`;
          img.src = imagePath;

          try {
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                console.log(`이모지 이미지 로드 성공: ${type}`);
                resolve();
              };
              img.onerror = () => {
                console.error(
                  `이모지 이미지 로드 실패: ${type} (${imagePath})`,
                );
                reject();
              };
              // 5초 타임아웃 설정
              setTimeout(() => reject(), 5000);
            });

            emojiImagesLoaded[type] = img;
          } catch {
            // 이모지 로드 실패 시 fallback으로 vercel.svg 사용
            const fallbackImg = new Image();
            fallbackImg.src = '/vercel.svg';

            await new Promise<void>(resolve => {
              fallbackImg.onload = () => {
                console.log(`대체 이모지 로드 성공: ${type}`);
                resolve();
              };
            });

            emojiImagesLoaded[type] = fallbackImg;
          }
        }),
      );

      setEmojiImages(emojiImagesLoaded);

      const userCharacters: UserCharacter[] = await Promise.all(
        participantInfo.map(
          participant =>
            new Promise<UserCharacter>(resolve => {
              const img = new Image();
              img.src = participant.character; // 직접 경로 사용
              img.onload = () => {
                resolve({
                  name: participant.userName,
                  position: 0,
                  image: img,
                  animationOffset: 0,
                  isMoving: false,
                  fromPosition: 0,
                  toPosition: 0,
                  moveProgress: 0,
                });
              };
              img.onerror = () => {
                console.error(
                  '캐릭터 이미지 로딩 실패:',
                  participant.character,
                );
                resolve({
                  name: participant.userName,
                  position: 0,
                  image: null,
                  animationOffset: 0,
                  isMoving: false,
                  fromPosition: 0,
                  toPosition: 0,
                  moveProgress: 0,
                });
              };
            }),
        ),
      );

      setCharacters(userCharacters);
      setIsLoading(false);
    };

    loadImages();
  }, [participantInfo]);

  const updateAnimation = (timestamp: number) => {
    if (!animationTimeRef.current) {
      animationTimeRef.current = timestamp;
    }

    const elapsed = timestamp - animationTimeRef.current;

    setCharacters(prevCharacters =>
      prevCharacters.map((character, index) => {
        const phaseOffset = index * 0.5;
        const newOffset =
          Math.sin((elapsed / 1000) * animationSpeedRef.current + phaseOffset) *
          animationRangeRef.current;

        let updatedCharacter = {
          ...character,
          animationOffset: newOffset,
        };

        // 캐릭터가 이동 중이면 이동 진행도 업데이트
        if (character.isMoving) {
          const moveElapsed = timestamp - moveStartTimeRef.current;
          const progress = Math.min(
            moveElapsed / moveAnimationDurationRef.current,
            1,
          );

          updatedCharacter.moveProgress = progress;

          // 이동이 완료되면 이동 상태 초기화
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
      }),
    );

    // 다음 프레임 요청
    animationFrameRef.current = requestAnimationFrame(updateAnimation);
  };

  // Canvas 그리기
  useEffect(() => {
    if (
      isLoading ||
      !canvasRef.current ||
      !footholderImage ||
      !bubbleImage ||
      !bubbleLeftImage ||
      !questionImage ||
      Object.values(emojiImages).every(img => !img) ||
      characters.length === 0
    ) {
      console.log('캔버스 그리기 조건 불충족:', {
        isLoading,
        hasCanvas: !!canvasRef.current,
        hasFootholderImage: !!footholderImage,
        hasBubbleImage: !!bubbleImage,
        hasBubbleLeftImage: !!bubbleLeftImage,
        hasQuestionImage: !!questionImage,
        hasEmojiImages: !Object.values(emojiImages).every(img => !img),
        charactersLength: characters.length,
      });
      return;
    }

    // console.log('캔버스 그리기 시작');
    // console.log('캐릭터 정보:', characters);
    // console.log('말풍선 정보:', { targetUser, triggerUser, eventType });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 애니메이션 시작
    animationFrameRef.current = requestAnimationFrame(updateAnimation);

    // Canvas 크기 설정 (화면 크기에 맞게)
    const updateCanvasSize = () => {
      if (!canvas || !ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawCanvas();
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    function drawCanvas() {
      if (
        !canvas ||
        !ctx ||
        !footholderImage ||
        !bubbleImage ||
        !bubbleLeftImage ||
        !questionImage ||
        Object.values(emojiImages).every(img => !img)
      )
        return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const leftSectionWidth = canvas.width * 0.75;
      const baseFootholderWidth = Math.min(48, leftSectionWidth * 0.08); // 기본 발판 크기
      const footholderPositions: {
        x: number;
        y: number;
        width: number;
        height: number;
      }[] = [];

      footholderRatios.forEach((position, index) => {
        // 비율을 실제 픽셀 좌표로 변환
        const x = position.xRatio * leftSectionWidth;
        const y = position.yRatio * canvas.height;

        // 발판 크기 (개별 크기 적용, 기본값은 1.5)
        const sizeMultiplier = position.size || 1.5;
        const footholderWidth = baseFootholderWidth * sizeMultiplier;
        const footholderHeight = footholderWidth;

        ctx.drawImage(
          footholderImage,
          x - footholderWidth / 2,
          y - footholderHeight / 2,
          footholderWidth,
          footholderHeight,
        );

        footholderPositions[index] = {
          x,
          y: y - footholderHeight / 2,
          width: footholderWidth,
          height: footholderHeight,
        };
      });

      characters.forEach(character => {
        if (!character.image) return;

        let characterX = 0;
        let characterY = 0;

        if (character.isMoving) {
          const fromPos = footholderPositions[character.fromPosition];
          const toPos = footholderPositions[character.toPosition];

          if (!fromPos || !toPos) return;

          const t = character.moveProgress;
          const easedProgress =
            t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

          characterX = fromPos.x + (toPos.x - fromPos.x) * easedProgress;
          characterY = fromPos.y + (toPos.y - fromPos.y) * easedProgress;

          const jumpHeight = 30 * Math.sin(Math.PI * easedProgress);
          characterY -= jumpHeight;
        } else {
          const footholderPos = footholderPositions[character.position];
          if (!footholderPos) return;

          characterX = footholderPos.x;
          characterY = footholderPos.y;
        }
        const characterWidth = baseFootholderWidth * 1.5;
        const characterHeight = characterWidth * 1.25;

        ctx.drawImage(
          character.image,
          characterX - characterWidth / 2 - 10,
          characterY - characterHeight + character.animationOffset,
          characterWidth,
          characterHeight,
        );

        ctx.font = '14px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // 텍스트에 외곽선 추가하여 가독성 향상
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(
          character.name,
          characterX,
          characterY - characterHeight - 10 + character.animationOffset,
        );

        // 글자 그리기
        ctx.fillText(
          character.name,
          characterX,
          characterY - characterHeight - 10 + character.animationOffset,
        );

        // 말풍선 그리기
        const bubbleWidth = characterWidth * 0.8;
        const bubbleHeight = bubbleWidth * 0.8;
        const emojiSize = bubbleWidth * 0.5;

        // targetUser가 현재 캐릭터인 경우 우측 상단에 말풍선 표시
        if (targetUser === character.name) {
          const rightBubbleX = characterX + characterWidth / 2 - 10;
          const rightBubbleY =
            characterY - characterHeight + character.animationOffset;

          // 우측 말풍선 그리기
          ctx.drawImage(
            bubbleImage,
            rightBubbleX,
            rightBubbleY,
            bubbleWidth,
            bubbleHeight,
          );

          // 우측 이모지 그리기
          ctx.drawImage(
            questionImage,
            rightBubbleX + bubbleWidth / 2 - emojiSize / 2,
            rightBubbleY + bubbleHeight / 2 - emojiSize / 2,
            emojiSize,
            emojiSize,
          );
        }

        // 현재 이벤트 타입에 맞는 이모지 이미지 선택
        const currentEmoji = emojiImages[eventType as EventType];

        if (!currentEmoji) return; // triggerUser가 현재 캐릭터인 경우 좌측 상단에 말풍선 표시

        if (triggerUser === character.name) {
          const leftBubbleX =
            characterX - characterWidth / 2 - bubbleWidth + 10;
          const leftBubbleY =
            characterY - characterHeight + character.animationOffset;

          // 좌측 말풍선 그리기
          ctx.drawImage(
            bubbleLeftImage,
            leftBubbleX,
            leftBubbleY,
            bubbleWidth,
            bubbleHeight,
          );

          // 좌측 이모지
          ctx.drawImage(
            currentEmoji,
            leftBubbleX + bubbleWidth / 2 - emojiSize / 2,
            leftBubbleY + bubbleHeight / 2 - emojiSize / 2,
            emojiSize,
            emojiSize,
          );
        }
      });
    }

    // targetUser, triggerUser, eventType이 변경될 때마다 다시 그리기
    const redrawOnBubbleChange = () => {
      if (targetUser && triggerUser) {
        console.log('말풍선 정보가 변경됨:', {
          targetUser,
          triggerUser,
          eventType,
        });
      }
      drawCanvas();
    };

    // 변수 변경 감지 및 강제 리렌더링
    redrawOnBubbleChange();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    isLoading,
    footholderImage,
    bubbleImage,
    bubbleLeftImage,
    questionImage,
    emojiImages,
    characters,
    targetUser,
    triggerUser,
    eventType,
  ]);

  return (
    <canvas ref={canvasRef} className='absolute top-0 left-0 h-full w-screen' />
  );
};

export default GameBoard;
