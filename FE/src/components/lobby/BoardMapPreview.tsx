import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

const BoardMapPreview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  // animationStep 관련 코드 제거
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  // 캐릭터 위치 상태와 애니메이션 정보
  const [character1, setCharacter1] = useState({
    position: 2,
    isMoving: false,
    fromPosition: 2,
    toPosition: 2,
    moveProgress: 0,
    moveStartTime: 0,
  });

  const [character2, setCharacter2] = useState({
    position: -1,
    isMoving: false,
    fromPosition: -1,
    toPosition: -1,
    moveProgress: 0,
    moveStartTime: 0,
  });

  // 카드 상태
  const [showCard, setShowCard] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  // 애니메이션 설정
  const moveAnimationDuration = 500; // 이동 애니메이션 시간 (ms)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    // 초기 크기 설정
    updateSize();

    // 윈도우 크기 변경 시 업데이트
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // easeInOut 함수 - 자연스러운 움직임을 위한 이징 함수
  const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // 애니메이션 프레임 업데이트 함수
  useEffect(() => {
    const animate = (timestamp: number) => {
      // 캐릭터 1 움직임 업데이트
      if (character1.isMoving) {
        const moveElapsed = timestamp - character1.moveStartTime;
        const progress = Math.min(moveElapsed / moveAnimationDuration, 1);

        if (progress >= 1) {
          setCharacter1(prev => ({
            ...prev,
            isMoving: false,
            position: prev.toPosition,
            fromPosition: prev.toPosition,
            moveProgress: 1,
          }));
        } else {
          setCharacter1(prev => ({
            ...prev,
            moveProgress: progress,
          }));
        }
      }

      // 캐릭터 2 움직임 업데이트
      if (character2.isMoving) {
        const moveElapsed = timestamp - character2.moveStartTime;
        const progress = Math.min(moveElapsed / moveAnimationDuration, 1);

        if (progress >= 1) {
          setCharacter2(prev => ({
            ...prev,
            isMoving: false,
            position: prev.toPosition,
            fromPosition: prev.toPosition,
            moveProgress: 1,
          }));
        } else {
          setCharacter2(prev => ({
            ...prev,
            moveProgress: progress,
          }));
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [character1.isMoving, character2.isMoving, moveAnimationDuration]);

  // 애니메이션 시작 - 초기 상태를 명확히 보여주기 위해 지연 시작
  useEffect(() => {
    // 컴포넌트 마운트 시 캐릭터 1이 발판 3에 있는 초기 상태를 명확히 보여줌
    setCharacter1({
      position: 2,
      isMoving: false,
      fromPosition: 2,
      toPosition: 2,
      moveProgress: 0,
      moveStartTime: 0,
    });

    setCharacter2({
      position: -1,
      isMoving: false,
      fromPosition: -1,
      toPosition: -1,
      moveProgress: 0,
      moveStartTime: 0,
    });

    // 초기 상태를 약간 유지한 후에 애니메이션 시작
    const timer = setTimeout(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        runAnimation();
      }
    }, 1000); // 1초 후에 애니메이션 시작

    return () => clearTimeout(timer);
  }, []);

  // 캐릭터 이동 시작 함수
  const startCharacterMove = (
    characterSetter: React.Dispatch<
      React.SetStateAction<{
        position: number;
        isMoving: boolean;
        fromPosition: number;
        toPosition: number;
        moveProgress: number;
        moveStartTime: number;
      }>
    >,
    fromPos: number,
    toPos: number,
  ) => {
    const now = performance.now();
    characterSetter(prev => ({
      ...prev,
      isMoving: true,
      fromPosition: fromPos,
      toPosition: toPos,
      moveProgress: 0,
      moveStartTime: now,
    }));

    // 이동이 완료되면 position 값 변경
    return new Promise<void>(resolve => {
      setTimeout(() => {
        characterSetter(prev => ({
          ...prev,
          position: toPos,
        }));
        resolve();
      }, moveAnimationDuration);
    });
  };

  // 애니메이션 시퀀스 실행
  const runAnimation = async () => {
    // 초기 상태 재확인
    setCharacter1({
      position: 2,
      isMoving: false,
      fromPosition: 2,
      toPosition: 2,
      moveProgress: 0,
      moveStartTime: 0,
    });

    setCharacter2({
      position: -1,
      isMoving: false,
      fromPosition: -1,
      toPosition: -1,
      moveProgress: 0,
      moveStartTime: 0,
    });

    setShowCard(false);
    setCardFlipped(false);

    // 초기 상태에서 잠시 대기
    await wait(1000);

    // 1. 캐릭터 2가 발판 1로 점프하듯이 입장
    await startCharacterMove(setCharacter2, -1, 0);

    await wait(1000);

    // 2. 가운데에서 이벤트 카드가 튀어나오듯이 나타남
    setShowCard(true);

    await wait(800);

    // 3. 카드가 뒤집어지면서 스위치 이미지가 나옴
    setCardFlipped(true);

    await wait(800);

    // 4. 카드가 사라짐
    setShowCard(false);

    await wait(500);

    // 5. 캐릭터 1과 캐릭터 2의 자리가 뒤바뀜
    await Promise.all([
      startCharacterMove(setCharacter1, 2, 0),
      startCharacterMove(setCharacter2, 0, 2),
    ]);

    await wait(1000);

    // 6. 캐릭터 2가 오른쪽으로 점프하여 화면에서 사라짐
    await startCharacterMove(setCharacter2, 2, -1); // 오른쪽으로 점프하여 화면에서 사라짐

    await wait(400);

    // 7. 캐릭터 1이 발판 2로 이동
    await startCharacterMove(setCharacter1, 0, 1); // 발판 1에서 발판 2로 이동

    await wait(400);

    // 8. 캐릭터 1이 발판 3으로 이동
    await startCharacterMove(setCharacter1, 1, 2); // 발판 2에서 발판 3으로 이동

    await wait(500);

    // 애니메이션 리셋 후 다시 시작
    setShowCard(false);
    setCardFlipped(false);

    await wait(1000);

    setCharacter1({
      position: 2,
      isMoving: false,
      fromPosition: 2,
      toPosition: 2,
      moveProgress: 0,
      moveStartTime: 0,
    });

    await wait(500);

    // 애니메이션 다시 시작
    runAnimation();
  };

  // 대기 시간을 위한 유틸리티 함수
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 발판 위치 계산 (상대적 위치)
  const footholderPositions = [
    { left: '20%', bottom: '5%' },
    { left: '50%', bottom: '13%' },
    { left: '80%', bottom: '20%' },
  ];

  // 발판 크기를 컨테이너 크기에 비례하도록 계산
  const getFootholderSize = () => {
    const size = Math.max(20, Math.min(50, containerSize.width * 0.18));
    return { width: size, height: size };
  };

  const footholderSize = getFootholderSize();

  // 캐릭터 크기 계산
  const getCharacterSize = () => {
    const size = Math.max(30, Math.min(70, containerSize.width * 0.12));
    return { width: size, height: size * 1.5 };
  };

  const characterSize = getCharacterSize();

  // 카드 크기 계산
  const getCardSize = () => {
    const width = Math.max(40, Math.min(100, containerSize.width * 0.25));
    const height = width * 1.4;
    return { width, height };
  };

  const cardSize = getCardSize();

  // 캐릭터 애니메이션 스타일 (점프 효과 추가)
  const getCharacterStyle = (character: {
    position: number;
    isMoving: boolean;
    fromPosition: number;
    toPosition: number;
    moveProgress: number;
  }) => {
    const { position, isMoving, fromPosition, toPosition, moveProgress } =
      character;

    // 화면 밖에 있는 경우
    if (position === -1 && !isMoving) {
      return { opacity: 0, transition: 'opacity 0.3s ease-out' };
    }

    // 화면 밖으로 사라지는 애니메이션 (캐릭터 2: 오른쪽으로 사라지게 수정)
    if (isMoving && toPosition === -1) {
      const fromFootholderPos = footholderPositions[fromPosition];
      const progress = easeInOut(moveProgress);

      // 캐릭터 2가 오른쪽으로 사라지는 로직 추가
      if (character === character2) {
        // 오른쪽으로 점프하면서 사라지는 효과
        return {
          left: `calc(${fromFootholderPos.left} + ${progress * 30}%)`,
          bottom: `calc(${fromFootholderPos.bottom} + ${footholderSize.height * 0.8}px + ${Math.sin(Math.PI * progress) * 100}px)`,
          transform: 'translateX(-50%)',
          opacity: 1 - progress,
          transition: 'none',
        };
      } else {
        // 캐릭터 1은 기존처럼 위로 사라지는 효과 유지
        return {
          left: fromFootholderPos.left,
          bottom: `calc(${fromFootholderPos.bottom} + ${(1 - progress) * footholderSize.height * 0.8}px)`,
          transform: `translateX(-50%) translateY(${-100 * progress}px)`,
          opacity: 1 - progress,
          transition: 'none',
        };
      }
    }

    // 화면 밖에서 등장하는 애니메이션
    if (isMoving && fromPosition === -1) {
      const toFootholderPos = footholderPositions[toPosition];
      const progress = easeInOut(moveProgress);

      // 왼쪽에서 점프하면서 나타나는 효과
      const initialLeft = `${parseFloat(toFootholderPos.left) - 20}%`; // 왼쪽에서 시작
      const currentLeft = `calc(${initialLeft} + ${progress * 20}%)`;

      // 점프 효과 (포물선 운동)
      const jumpHeight = Math.min(containerSize.height * 0.2, 80); // 점프 높이
      const jumpOffset = Math.sin(Math.PI * progress) * jumpHeight;

      return {
        left: currentLeft,
        bottom: `calc(${toFootholderPos.bottom} + ${footholderSize.height * 0.8}px + ${jumpOffset}px)`,
        transform: 'translateX(-50%)',
        opacity: progress,
        transition: 'none',
      };
    }

    // 일반 이동 애니메이션
    if (isMoving) {
      const fromFootholderPos = footholderPositions[fromPosition];
      const toFootholderPos = footholderPositions[toPosition];
      const progress = easeInOut(moveProgress);

      // fromLeft와 toLeft를 퍼센트 문자열에서 숫자로 변환
      const fromLeft = parseFloat(fromFootholderPos.left) / 100;
      const toLeft = parseFloat(toFootholderPos.left) / 100;

      // fromBottom과 toBottom을 퍼센트 문자열에서 숫자로 변환
      const fromBottom = parseFloat(fromFootholderPos.bottom) / 100;
      const toBottom = parseFloat(toFootholderPos.bottom) / 100;

      // 현재 위치 계산 (퍼센트 단위)
      const currentLeft = `${(fromLeft + (toLeft - fromLeft) * progress) * 100}%`;
      const baseBottom = `${(fromBottom + (toBottom - fromBottom) * progress) * 100}%`;

      // 점프 효과 (포물선 운동)
      const jumpHeight = Math.min(containerSize.height * 0.2, 100); // 점프 높이
      const jumpOffset = Math.sin(Math.PI * progress) * jumpHeight;

      return {
        left: currentLeft,
        bottom: `calc(${baseBottom} + ${footholderSize.height * 0.8}px + ${jumpOffset}px)`,
        transform: 'translateX(-50%)',
        opacity: 1,
        transition: 'none',
      };
    }

    // 기본 정지 상태
    const footholderPos = footholderPositions[position];
    return {
      left: footholderPos.left,
      bottom: `calc(${footholderPos.bottom} + ${footholderSize.height * 0.8}px)`,
      transform: 'translateX(-50%)',
      opacity: 1,
      transition: 'none',
    };
  };

  // 카드 애니메이션 스타일
  const getCardStyle = () => {
    if (!showCard) {
      return {
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(0.1)',
        transition: 'all 0.5s ease-out',
      };
    }

    return {
      opacity: 1,
      transform: cardFlipped
        ? 'translate(-50%, -50%) scale(1) rotateY(180deg)'
        : 'translate(-50%, -50%) scale(1)',
      transition: 'all 0.6s ease-out',
    };
  };

  return (
    <div
      ref={containerRef}
      className='relative h-full w-full overflow-hidden bg-[#9176CC]'
    >
      {/* 발판 3개 */}
      {footholderPositions.map((position, index) => (
        <div
          key={index}
          className='absolute'
          style={{
            left: position.left,
            bottom: position.bottom,
            transform: 'translateX(-50%)',
            width: `${footholderSize.width}px`,
            height: `${footholderSize.height}px`,
          }}
        >
          <div className='relative h-full w-full'>
            <Image
              src='/footholder.svg'
              alt='footholder'
              fill
              className='object-contain'
            />
          </div>
        </div>
      ))}

      {/* 캐릭터 1 */}
      <div
        className='absolute'
        style={{
          width: `${characterSize.width}px`,
          height: `${characterSize.height}px`,
          ...getCharacterStyle(character1),
        }}
      >
        <div className='relative h-full w-full'>
          <Image
            src='/character/character_1.svg'
            alt='character 1'
            fill
            className='object-contain'
          />
        </div>
      </div>

      {/* 캐릭터 2 */}
      <div
        className='absolute'
        style={{
          width: `${characterSize.width}px`,
          height: `${characterSize.height}px`,
          ...getCharacterStyle(character2),
        }}
      >
        <div className='relative h-full w-full'>
          <Image
            src='/character/character_0.svg'
            alt='character 2'
            fill
            className='object-contain'
          />
        </div>
      </div>

      {/* 이벤트 카드 */}
      <div
        className='perspective-500 absolute top-1/2 left-1/2 origin-center'
        style={{
          width: `${cardSize.width}px`,
          height: `${cardSize.height}px`,
          transformStyle: 'preserve-3d',
          ...getCardStyle(),
        }}
      >
        {/* 카드 앞면 (느낌표) */}
        <div
          className='absolute flex h-full w-full items-center justify-center rounded-lg bg-white shadow-lg backface-hidden'
          style={{
            transform: 'rotateY(0deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className='relative h-3/4 w-3/4'>
            <Image
              src='/eventemoji/mark.svg'
              alt='mark'
              fill
              className='object-contain'
            />
          </div>
        </div>

        {/* 카드 뒷면 (스위치) */}
        <div
          className='absolute flex h-full w-full items-center justify-center rounded-lg bg-white shadow-lg backface-hidden'
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className='relative h-3/4 w-3/4'>
            <Image
              src='/eventemoji/swap.svg'
              alt='switch'
              fill
              className='object-contain'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardMapPreview;
