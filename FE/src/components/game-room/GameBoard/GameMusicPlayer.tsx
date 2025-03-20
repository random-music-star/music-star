import React, { useEffect, useRef, useState } from 'react';

import ReactPlayer from 'react-player';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useGameRoundResultStore } from '@/stores/websocket/useGameRoundResultStore';
import { useGameScreenStore } from '@/stores/websocket/useGameScreenStore';

interface MusicPlayerProps {
  gameState: 'GAME_RESULT' | 'QUIZ_OPEN';
}

const GameMusicPlayer = ({ gameState }: MusicPlayerProps) => {
  // 플레이어 상태 및 참조
  const playerRef = useRef<ReactPlayer>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // 미디어 세션을 위한 빈 오디오 요소
  const blankAudioRef = useRef<HTMLAudioElement | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { songUrl, gameHint } = useGameScreenStore();
  const { roundInfo } = useGameRoundInfoStore();
  const { gameRoundResult } = useGameRoundResultStore();

  // 미디어 세션 강제 업데이트 함수
  const updateMediaSession = () => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: '음악 퀴즈',
        artist: '게임',
        album: '게임 오디오',
      });
    }
  };

  // 무음 오디오 재생 시작 함수
  const startBlankAudio = () => {
    if (
      blankAudioRef.current &&
      (blankAudioRef.current.paused || !isAudioPlaying)
    ) {
      blankAudioRef.current
        .play()
        .then(() => {
          setIsAudioPlaying(true);
          console.log('무음 오디오 재생 시작');
        })
        .catch(err => {
          console.warn('무음 오디오 재생 오류:', err);
          // 다시 시도 설정
          setTimeout(startBlankAudio, 1000);
        });
    }
  };

  // 미디어 세션 관리 및 무음 오디오 트랙 설정
  useEffect(() => {
    // 새로운 미디어 세션 메타데이터 설정
    if ('mediaSession' in navigator) {
      try {
        updateMediaSession();

        // 모든 미디어 세션 액션 핸들러 빈 함수로 설정
        const actions = [
          'play',
          'pause',
          'seekbackward',
          'seekforward',
          'previoustrack',
          'nexttrack',
        ];

        actions.forEach(action => {
          try {
            navigator.mediaSession.setActionHandler(
              action as MediaSessionAction,
              () => {
                console.log(`미디어 세션 액션 무시: ${action}`);
                // 무음 오디오 재시작 및 메타데이터 재설정
                startBlankAudio();
                updateMediaSession();
              },
            );
          } catch (e) {
            console.warn(`'${action}' 액션 설정 불가:`, e);
          }
        });
      } catch (e) {
        console.warn('미디어 세션 메타데이터 설정 오류:', e);
      }
    }

    // 무음 오디오 트랙 생성
    if (!blankAudioRef.current) {
      const audio = new Audio('/audio/noneSound.wav');
      audio.loop = true;
      audio.autoplay = false;
      audio.volume = 0.02; // 아주 작은 볼륨으로 설정 (0이 아닌)
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');

      // 오디오 이벤트 리스너 추가
      audio.addEventListener('play', () => {
        setIsAudioPlaying(true);
        updateMediaSession();
      });

      audio.addEventListener('pause', () => {
        setIsAudioPlaying(false);
        // 자동으로 다시 재생 시도
        setTimeout(startBlankAudio, 500);
      });

      document.body.appendChild(audio);
      blankAudioRef.current = audio;

      // 무음 오디오 재생 시작
      startBlankAudio();
    }

    // 주기적으로 미디어 세션 메타데이터 업데이트
    metadataIntervalRef.current = setInterval(() => {
      updateMediaSession();

      // 무음 오디오가 정지되었다면 다시 시작
      if (blankAudioRef.current && blankAudioRef.current.paused) {
        startBlankAudio();
      }
    }, 1000);

    return () => {
      // 정리
      if (blankAudioRef.current) {
        blankAudioRef.current.pause();
        blankAudioRef.current.remove();
        blankAudioRef.current = null;
      }

      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
        metadataIntervalRef.current = null;
      }
    };
  }, []);

  // ReactPlayer 이벤트 핸들러
  const handleReady = () => {
    console.log('플레이어 준비 완료');
    updateMediaSession();
    startBlankAudio();
  };

  const handlePlay = () => {
    console.log('재생 시작');
    updateMediaSession();
    startBlankAudio();
  };

  const handleError = (error: unknown) => {
    console.error('플레이어 오류:', error);
    setPlayerError('플레이어를 로드하는 중 오류가 발생했습니다.');
  };

  // videoId 변경 시마다 무음 오디오 재생 및 메타데이터 재설정
  useEffect(() => {
    if (!songUrl) return;

    updateMediaSession();
    startBlankAudio();

    // 비디오가 변경될 때마다 강제로 메타데이터 여러 번 업데이트
    const forceUpdateTimes = [0, 500, 1000, 2000, 3000];
    forceUpdateTimes.forEach(delay => {
      setTimeout(() => {
        updateMediaSession();
        if (blankAudioRef.current && blankAudioRef.current.paused) {
          startBlankAudio();
        }
      }, delay);
    });
  }, [songUrl]);

  if (!roundInfo) return null;
  // 조건부 렌더링 수정 (songUrl이 없는 경우 빈 div 반환)
  if (!songUrl) return <div></div>;

  const { round: currentRound } = roundInfo;

  return (
    <div className='w-full'>
      {/* ReactPlayer 숨기기 */}
      <div className='pointer-events-none invisible fixed top-[-9999px] left-[-9999px] h-1 w-1 overflow-hidden opacity-0'>
        <ReactPlayer
          ref={playerRef}
          url={songUrl}
          playing={true}
          controls={false}
          width='1px'
          height='1px'
          volume={1}
          muted={false}
          onReady={handleReady}
          onPlay={handlePlay}
          onError={handleError}
          config={{
            youtube: {
              playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                playsinline: 1,
                iv_load_policy: 3,
                enablejsapi: 1,
                origin: window.location.origin,
                host: 'https://www.youtube-nocookie.com',
              },
              embedOptions: {
                allow: 'autoplay; encrypted-media',
              },
            },
          }}
          style={{
            position: 'fixed',
            top: '-9999px',
            left: '-9999px',
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none',
            visibility: 'hidden',
            zIndex: -9999,
          }}
        />
      </div>

      {/* 헤더 */}
      <div className='mb-4 text-center'>
        <h2 className='text-xl font-bold text-fuchsia-300'>
          라운드 {currentRound}
        </h2>
      </div>

      {/* 메인 컨텐츠 - 기존 코드와 동일 */}
      {gameState === 'QUIZ_OPEN' && (
        <div className='flex flex-col items-center text-purple-100'>
          {/* 음악 아이콘 애니메이션 */}
          <div className='mb-4 flex justify-center'>
            <div className='flex items-end space-x-2'>
              {[1, 2, 3, 4].map(bar => (
                <div
                  key={bar}
                  className='w-3 animate-pulse bg-fuchsia-500/70'
                  style={{
                    height: `${16 + bar * 8}px`,
                    animationDelay: `${bar * 0.2}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* 플레이어 오류 표시 */}
          {playerError && (
            <div className='mb-2 text-sm text-red-400'>{playerError}</div>
          )}

          {/* 힌트 정보 */}
          <div className='w-full space-y-4 text-base'>
            <div className='flex justify-between gap-12'>
              <span className='font-medium text-purple-200'>가수</span>
              <span className='font-bold text-fuchsia-200'>
                {!gameHint
                  ? '잠시 후 공개'
                  : gameHint.singer
                    ? gameHint.singer
                    : '잠시 후 공개'}
              </span>
            </div>

            <div className='flex justify-between gap-12'>
              <span className='font-medium text-purple-200'>제목</span>
              <span className='font-bold text-fuchsia-200'>
                {!gameHint
                  ? '잠시 후 공개'
                  : gameHint.title
                    ? gameHint.title
                    : '잠시 후 공개'}
              </span>
            </div>
          </div>

          {/* 안내 텍스트 */}
          <div className='mt-6 text-center text-sm text-purple-200'>
            <p>
              채팅창에 정답을 입력하세요 (스킵:{' '}
              <span className='text-fuchsia-300'>.</span>)
            </p>
          </div>
        </div>
      )}

      {gameState === 'GAME_RESULT' && gameRoundResult && (
        <div className='flex flex-col items-center'>
          <div className='mb-4 text-center'>
            <h3 className='text-xl font-bold text-fuchsia-300'>정답 공개!</h3>
          </div>

          <div className='w-full space-y-4 text-base text-purple-100'>
            {/* 우승자 정보 */}
            {gameRoundResult.winner && (
              <div className='mb-5 flex items-center justify-center'>
                <div className='text-center'>
                  <span className='mb-1 block text-sm font-medium text-purple-200'>
                    정답자
                  </span>
                  <span className='text-lg font-bold text-yellow-300'>
                    {gameRoundResult.winner}
                  </span>
                </div>
              </div>
            )}

            <div className='flex justify-between gap-12'>
              <span className='font-medium text-purple-200'>가수</span>
              <span className='font-bold text-fuchsia-200'>
                {gameRoundResult.singer || '정보 없음'}
              </span>
            </div>

            <div className='flex justify-between gap-12'>
              <span className='font-medium text-purple-200'>제목</span>
              <span className='font-bold text-fuchsia-200'>
                {gameRoundResult.songTitle || '정보 없음'}
              </span>
            </div>
          </div>

          <div className='mt-6 text-center text-sm text-fuchsia-200'>
            노래는 재생 중...
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMusicPlayer;
