import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

// 시상대 위에 캐릭터들이 서있고 순차적으로 점수를 획득하는 애니메이션 컴포넌트
const GeneralMapPreview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // 캐릭터 상태 - 회전을 위한 속성 포함
  const [characters, setCharacters] = useState([
    { id: 1, position: 1, isWiggling: false, rotationAngle: 0 }, // 1등 캐릭터
    { id: 2, position: 0, isWiggling: false, rotationAngle: 0 }, // 2등 캐릭터
    { id: 3, position: 2, isWiggling: false, rotationAngle: 0 }, // 3등 캐릭터
  ]);

  // 점수 상태
  const [scores, setScores] = useState([
    { position: 1, value: 6 }, // 1등 점수
    { position: 0, value: 4 }, // 2등 점수
    { position: 2, value: 3 }, // 3등 점수
  ]);

  // 카드 상태
  const [showCard, setShowCard] = useState(false);
  const [cardOpacity, setCardOpacity] = useState(0);

  // 점수가 오른 캐릭터 추적
  const [scoredCharacter, setScoredCharacter] = useState<number | null>(null);

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

  // 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        runAnimation();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 점수 오른 캐릭터 까딱거림 애니메이션
  useEffect(() => {
    let wiggleAnimationId: number;

    const animateWiggle = () => {
      if (scoredCharacter !== null) {
        setCharacters(prevChars => {
          return prevChars.map(char => {
            if (char.id === scoredCharacter) {
              // 사인파를 사용하여 부드러운 좌우 까딱거림 효과 생성
              // 회전 각도를 작게 설정하여 미세한 움직임 표현 (±3도)
              const rotationAngle = Math.sin(Date.now() / 100) * 3;
              return { ...char, isWiggling: true, rotationAngle };
            }
            return { ...char, isWiggling: false, rotationAngle: 0 };
          });
        });
      }
      wiggleAnimationId = requestAnimationFrame(animateWiggle);
    };

    if (isAnimating && scoredCharacter !== null) {
      wiggleAnimationId = requestAnimationFrame(animateWiggle);
    }

    return () => {
      if (wiggleAnimationId) {
        cancelAnimationFrame(wiggleAnimationId);
      }
    };
  }, [isAnimating, scoredCharacter]);

  // 대기 시간을 위한 유틸리티 함수
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 단일 캐릭터 애니메이션 처리
  const animateCharacter = async (positionIndex: number) => {
    // 카드 표시 애니메이션
    setShowCard(true);
    setCardOpacity(0);

    // 카드 페이드인
    for (let i = 0; i <= 10; i++) {
      await wait(50);
      setCardOpacity(i / 10);
    }
    await wait(1500);

    // 카드 페이드아웃
    for (let i = 10; i >= 0; i--) {
      await wait(30);
      setCardOpacity(i / 10);
    }
    setShowCard(false);
    await wait(500);

    // 점수 업데이트
    setScores(prevScores => {
      return prevScores.map(score => {
        if (score.position === positionIndex) {
          return { ...score, value: score.value + 1 };
        }
        return score;
      });
    });

    // 점수 오른 캐릭터 설정
    const updatedChar = characters.find(
      char => char.position === positionIndex,
    );
    if (updatedChar) {
      setScoredCharacter(updatedChar.id);
    }
    await wait(2000); // 까딱거림 애니메이션 보여주는 시간

    // 애니메이션 종료 및 원래 상태로 복귀
    setScoredCharacter(null);
  };

  // 전체 애니메이션 시퀀스 실행
  const runAnimation = async () => {
    // 초기 상태 리셋
    setScoredCharacter(null);
    await wait(1000);

    // 1등 캐릭터 애니메이션
    await animateCharacter(1);
    // 2등 캐릭터 애니메이션
    await animateCharacter(0);
    // 3등 캐릭터 애니메이션
    await animateCharacter(2);
    await wait(1000);

    // 애니메이션 반복
    runAnimation();
  };

  // 시상대 위치 계산 (상대적 위치)
  const podiumPositions = [
    { left: '22%', bottom: '0%', height: '20%', label: '2' }, // 2등 시상대
    { left: '50%', bottom: '0%', height: '25%', label: '1' }, // 1등 시상대
    { left: '78%', bottom: '0%', height: '15%', label: '3' }, // 3등 시상대
  ];

  // 캐릭터 위치 계산 (시상대와 분리)
  const getCharacterPosition = (podiumIndex: number) => {
    const podium = podiumPositions[podiumIndex];
    return {
      left: podium.left,
      bottom: `calc(${podium.height} + 2px)`,
    };
  };

  // 점수 위치 계산 (시상대와 분리)
  const getScorePosition = (podiumIndex: number) => {
    const podium = podiumPositions[podiumIndex];
    return {
      left: podium.left,
      top: '5%',
    };
  };

  // 캐릭터 크기 계산
  const getCharacterSize = () => {
    const size = Math.max(30, Math.min(60, containerSize.width * 0.1));
    return { width: size, height: size * 1.5 };
  };
  const characterSize = getCharacterSize();

  // 카드 크기 계산
  const getCardSize = () => {
    const width = Math.max(100, Math.min(200, containerSize.width * 0.3));
    const height = width * 0.4;
    return { width, height };
  };
  const cardSize = getCardSize();

  return (
    <div
      ref={containerRef}
      className='relative h-full w-full overflow-hidden bg-[url(/background.svg)] bg-cover bg-center'
      data-testid='general-map-preview'
    >
      {/* 시상대 */}
      {podiumPositions.map((position, index) => (
        <div
          key={`podium-${index}`}
          className='absolute flex items-center justify-center border-1 border-yellow-400 bg-yellow-100'
          style={{
            left: position.left,
            bottom: position.bottom,
            transform: 'translateX(-50%)',
            width: `${characterSize.width * 1.5}px`,
            height: position.height,
            zIndex: 1,
          }}
        >
          <span className='text-sm font-bold text-gray-700'>
            {position.label}
          </span>
        </div>
      ))}

      {/* 캐릭터 */}
      {characters.map(char => {
        const position = getCharacterPosition(char.position);
        return (
          <div
            key={`character-${char.id}`}
            className='absolute'
            style={{
              width: `${characterSize.width}px`,
              height: `${characterSize.height}px`,
              left: position.left,
              bottom: position.bottom,
              transform: 'translateX(-50%)',
              zIndex: 2,
            }}
          >
            <div
              className='relative h-full w-full'
              style={{
                transformOrigin: 'center bottom',
                transform: char.isWiggling
                  ? `rotate(${char.rotationAngle}deg)`
                  : 'rotate(0deg)',
                transition: char.isWiggling
                  ? 'none'
                  : 'transform 0.5s ease-out',
              }}
            >
              <Image
                src={`/character/character_${char.id - 1}.svg`}
                alt={`character ${char.id}`}
                fill
                className='object-contain'
              />
            </div>
          </div>
        );
      })}

      {/* 점수 (독립적으로 배치, 상단에 고정) */}
      {scores.map((score, index) => {
        const position = getScorePosition(score.position);
        return (
          <div
            key={`score-${index}`}
            className='absolute flex justify-center'
            style={{
              left: position.left,
              top: position.top,
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <div className='rounded-full bg-white px-3 text-xs font-bold shadow-md'>
              {score.value}
            </div>
          </div>
        );
      })}

      {/* 정답 카드 */}
      {showCard && (
        <div
          className='absolute top-1/2 left-1/2 flex items-center justify-center rounded-lg bg-[#9FFCFE] shadow-lg'
          style={{
            width: `${cardSize.width}px`,
            height: `${cardSize.height}px`,
            transform: 'translate(-50%, -50%)',
            opacity: cardOpacity,
            transition: 'opacity 0.3s ease',
            zIndex: 20,
          }}
        >
          <div className='text-xl font-bold text-black'>정답</div>
        </div>
      )}
    </div>
  );
};

export default GeneralMapPreview;
