import React, { useEffect, useRef, useState } from 'react';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useGameRoundResultStore } from '@/stores/websocket/useGameRoundResultStore';
import { useGameScreenStore } from '@/stores/websocket/useGameScreenStore';

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
}

interface YouTubeEvent {
  data: number;
  target: YouTubePlayer;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          height: string | number;
          width: string | number;
          videoId: string;
          playerVars: {
            autoplay: number;
            controls: number;
            disablekb: number;
            fs: number;
            modestbranding: number;
            rel: number;
            host?: string;
          };
          events: {
            onReady: (event: YouTubeEvent) => void;
          };
        },
      ) => YouTubePlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface MusicPlayerProps {
  gameState: 'GAME_RESULT' | 'QUIZ_OPEN';
}

const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const shortUrlRegex = /youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|$)/;
  const shortUrlMatch = url.match(shortUrlRegex);
  if (shortUrlMatch) return shortUrlMatch[1];

  const standardRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&|$)/;
  const standardMatch = url.match(standardRegex);
  if (standardMatch) return standardMatch[1];

  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (videoIdRegex.test(url)) return url;

  console.error('지원되지 않는 YouTube URL 형식입니다:', url);
  return null;
};

const GameMusicPlayer = ({ gameState }: MusicPlayerProps) => {
  const [videoId, setVideoId] = useState<string>('');
  const playerRef = useRef<YouTubePlayer | null>(null);
  const ytApiLoadedRef = useRef<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const { songUrl, gameHint } = useGameScreenStore();
  const { roundInfo } = useGameRoundInfoStore();
  const { gameRoundResult } = useGameRoundResultStore();

  useEffect(() => {
    if (songUrl) {
      const extractedId = extractYouTubeVideoId(songUrl);
      if (extractedId) {
        setVideoId(extractedId);
      }
    }
  }, [songUrl]);

  useEffect(() => {
    if (!window.YT && !ytApiLoadedRef.current) {
      ytApiLoadedRef.current = true;
      const tag: HTMLScriptElement = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag: HTMLScriptElement | null =
        document.getElementsByTagName('script')[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          host: 'https://www.youtube-nocookie.com',
        },
        events: {
          onReady: onPlayerReady,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  useEffect(() => {
    const applyStyles = () => {
      try {
        const iframe = playerRef.current?.getIframe();
        if (iframe) {
          iframe.style.position = 'absolute';
          iframe.style.opacity = '0.01';
          iframe.style.pointerEvents = 'none';
          iframe.style.left = '-1000px';
          iframe.setAttribute('tabindex', '-1');
        }
      } catch (error) {
        console.error('iframe 스타일링 오류:', error);
      }
    };

    if (playerRef.current) {
      const styleTimer = setInterval(() => {
        try {
          if (playerRef.current?.getIframe()) {
            applyStyles();
            clearInterval(styleTimer);
          }
        } catch (error) {
          console.error(error);
        }
      }, 300);

      return () => clearInterval(styleTimer);
    }
  }, [playerRef.current]);

  const onPlayerReady = (event: YouTubeEvent): void => {
    event.target.playVideo();

    try {
      const iframe = event.target.getIframe();
      if (iframe) {
        iframe.style.position = 'absolute';
        iframe.style.opacity = '0.01';
        iframe.style.pointerEvents = 'none';
        iframe.style.left = '-1000px';
        iframe.setAttribute('tabindex', '-1');
      }
    } catch (error) {
      console.error('iframe 초기 스타일링 오류:', error);
    }
  };

  if (!roundInfo) return null;
  const { round: currentRound } = roundInfo;

  return (
    <div className='w-full'>
      {/* 숨겨진 YouTube 플레이어 */}
      <div
        ref={playerContainerRef}
        className='pointer-events-none absolute h-1 w-1 overflow-hidden opacity-0'
      >
        <div id='youtube-player'></div>
      </div>

      {/* 헤더 */}
      <div className='mb-4 text-center'>
        <h2 className='text-xl font-bold text-fuchsia-300'>
          라운드 {currentRound}
        </h2>
      </div>

      {/* 메인 컨텐츠 */}
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
