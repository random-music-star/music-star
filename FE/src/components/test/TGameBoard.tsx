import { useEffect, useRef, useState } from 'react';

import { useGameBoardInfoStore } from '@/stores/websocket/useGameBoardInfoStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';

interface FootholderPosition {
  xRatio: number;
  yRatio: number;
  size?: number; // 발판 크기 배율 (기본값 1.5)
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

const TGameBoard = () => {
  const { boardInfo } = useGameBoardInfoStore();
  const { participantInfo } = useParticipantInfoStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [footholderImage, setFootholderImage] =
    useState<HTMLImageElement | null>(null);

  const [characters, setCharacters] = useState<UserCharacter[]>([]);

  // 애니메이션 상태 관리
  const animationTimeRef = useRef<number>(0);
  const animationSpeedRef = useRef<number>(5); // 애니메이션 속도 조절 (높을수록 빠름)
  const animationRangeRef = useRef<number>(10); // 애니메이션 이동 범위 (픽셀)
  const moveAnimationDurationRef = useRef<number>(1000); // 이동 애니메이션 시간 (밀리초)
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

      // 캐릭터 이미지 로딩 및 유저 캐릭터 생성
      const characterImg = new Image();
      characterImg.src = '/yellow.svg';
      characterImg.onload = () => {
        // 캐릭터 생성
        const userCharacters: UserCharacter[] = [];

        participantInfo.forEach(participant => {
          // 위치 값이 범위를 벗어나지 않도록 확인
          // 초기값
          participant.userName;
          const validPosition = Math.min(
            Math.max(0, 0),
            footholderRatios.length - 1,
          );

          userCharacters.push({
            name: participant.userName,
            position: validPosition,
            image: characterImg,
            animationOffset: 0, // 초기 애니메이션 오프셋
            isMoving: false,
            fromPosition: validPosition,
            toPosition: validPosition,
            moveProgress: 0,
          });
        });

        setCharacters(userCharacters);
        setIsLoading(false);
      };
    };

    loadImages();
  }, []);

  // 애니메이션 업데이트 함수
  const updateAnimation = (timestamp: number) => {
    if (!animationTimeRef.current) {
      animationTimeRef.current = timestamp;
    }

    const elapsed = timestamp - animationTimeRef.current;

    // 각 캐릭터마다 약간씩 다른 애니메이션 위상을 갖도록 업데이트
    setCharacters(prevCharacters =>
      prevCharacters.map((character, index) => {
        // 캐릭터 상하 애니메이션
        const phaseOffset = index * 0.5;
        const newOffset =
          Math.sin((elapsed / 1000) * animationSpeedRef.current + phaseOffset) *
          animationRangeRef.current;

        // 캐릭터 이동 애니메이션 업데이트
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
      //   !backgroundImage ||
      characters.length === 0
    )
      return;

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

    // 화면 크기 변경 감지
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    // Canvas에 그리기
    function drawCanvas() {
      if (!canvas || !ctx || !footholderImage) return;
      //   !backgroundImage ||

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 왼쪽 3/4 영역의 너비 계산
      const leftSectionWidth = canvas.width * 0.75;

      // 발판 이미지 그리기
      const baseFootholderWidth = Math.min(48, leftSectionWidth * 0.08); // 기본 발판 크기

      // 발판 좌표 정보 저장 (캐릭터 배치를 위해)
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
        const footholderHeight = footholderWidth; // 정사각형 유지

        ctx.drawImage(
          footholderImage,
          x - footholderWidth / 2, // 중심점 기준으로 좌표 조정
          y - footholderHeight / 2,
          footholderWidth,
          footholderHeight,
        );

        // 발판 위치 정보 저장
        footholderPositions[index] = {
          x,
          y: y - footholderHeight / 2, // 발판 상단 위치
          width: footholderWidth,
          height: footholderHeight,
        };
      });

      // 모든 캐릭터 그리기
      characters.forEach(character => {
        if (!character.image) return;

        let characterX = 0;
        let characterY = 0;

        if (character.isMoving) {
          // 이동 애니메이션 중인 경우 시작 위치와 목표 위치 사이를 보간
          const fromPos = footholderPositions[character.fromPosition];
          const toPos = footholderPositions[character.toPosition];

          if (!fromPos || !toPos) return;

          // 이지잉(Easing) 함수를 적용하여 자연스러운 이동 (이 예제에서는 ease-in-out)
          const t = character.moveProgress;
          const easedProgress =
            t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

          // 시작 위치와 목표 위치 사이를 선형 보간
          characterX = fromPos.x + (toPos.x - fromPos.x) * easedProgress;
          characterY = fromPos.y + (toPos.y - fromPos.y) * easedProgress;

          // 이동 중에는 약간 더 높게 뛰는 효과 추가
          const jumpHeight = 30 * Math.sin(Math.PI * easedProgress);
          characterY -= jumpHeight;
        } else {
          // 정지 상태인 경우 현재 발판 위치 사용
          const footholderPos = footholderPositions[character.position];
          if (!footholderPos) return;

          characterX = footholderPos.x;
          characterY = footholderPos.y;
        }

        // 고정된 캐릭터 크기 (발판 크기에 관계없이 일정)
        const characterWidth = baseFootholderWidth * 1.5; // 기본 발판 크기의 1.5배
        const characterHeight = characterWidth * 1.25; // 높이:너비 비율 = 1.25:1

        // 캐릭터 그리기
        ctx.drawImage(
          character.image,
          characterX - characterWidth / 2 - 10, // 발판 중앙에 배치 (약간 왼쪽으로)
          characterY - characterHeight + character.animationOffset, // 애니메이션 오프셋 적용
          characterWidth,
          characterHeight,
        );

        // 캐릭터 위에 닉네임 표시
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
      });
    }

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isLoading, footholderImage, characters]);

  return (
    <canvas ref={canvasRef} className='absolute top-0 left-0 h-full w-full' />
  );
};

export default TGameBoard;
