import React, { useEffect, useRef, useState } from 'react';

interface GameData {
  currentRound: number;
  totalRounds: number;
  artist: string;
  initialConsonant: string;
  skipVotes: number;
  youtubeId: string;
}

const GAME_DATA: GameData = {
  currentRound: 29,
  totalRounds: 30,
  artist: '아이들',
  initialConsonant: 'ㅌㅂㅇ',
  skipVotes: 0,
  youtubeId: 'pCIJxLOKieo',
};

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
            onStateChange: (event: YouTubeEvent) => void;
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

const MusicPlayer: React.FC<{ youtubeUrl?: string }> = ({ youtubeUrl }) => {
  const [videoId, setVideoId] = useState<string>(GAME_DATA.youtubeId);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const ytApiLoadedRef = useRef<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // youtubeUrl prop이 변경될 때만 videoId 업데이트
  useEffect(() => {
    if (youtubeUrl) {
      const extractedId = extractYouTubeVideoId(youtubeUrl);
      if (extractedId) {
        setVideoId(extractedId);
      }
    }
  }, [youtubeUrl]);

  // YouTube API 로드 및 플레이어 초기화
  useEffect(() => {
    // YouTube API가 이미 로드되어 있는지 확인
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

    // YouTube API 사용 준비 함수
    const initPlayer = () => {
      // 기존 플레이어 제거
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      // YouTube 플레이어 초기화
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
          onStateChange: onPlayerStateChange,
        },
      });
    };

    // YT API가 이미 로드되어 있으면 바로 플레이어 초기화
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // YT API가 로드되면 플레이어 초기화
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    // 컴포넌트 언마운트 시 플레이어 정리
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // YouTube 플레이어 iframe을 숨기는 스타일 적용
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

    // YouTube 플레이어가 로드된 후 스타일 적용을 위한 타이머
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

  const onPlayerStateChange = (event: YouTubeEvent): void => {
    if (event.data === window.YT.PlayerState.ENDED) {
      console.log('동영상 재생 완료');
    }
  };

  return (
    <div className='w-full h-full flex flex-col bg-gray-100 rounded-lg overflow-hidden max-w-lg mx-auto'>
      <div
        ref={playerContainerRef}
        className='absolute w-1 h-1 overflow-hidden opacity-0 pointer-events-none'
      >
        <div id='youtube-player'></div>
      </div>

      <div className='bg-gray-700 text-white p-3'>
        <div className='flex justify-center items-center'>
          <h2 className='text-xl font-bold'>
            남은곡 [ {GAME_DATA.currentRound} / {GAME_DATA.totalRounds} ]
          </h2>
        </div>
      </div>

      <div className='flex-1 flex flex-col p-6 justify-center items-center'>
        <div className='mb-6 text-center'>
          <p className='text-xl font-semibold'>
            <span className='text-gray-800 font-bold'>정답</span>을 듣고
            <span className='text-gray-600 font-bold'>답</span>을 입력하세요.
          </p>
        </div>

        <div className='bg-gray-200 p-5 rounded-lg mb-6 w-fit'>
          <div className='flex flex-col space-y-4 '>
            <div className='flex justify-between border-b border-gray-300 pb-3 gap-10'>
              <span className='text-gray-600 font-medium'>가수힌트</span>
              <span className='font-bold text-gray-800'>
                {GAME_DATA.artist}
              </span>
            </div>
            <div className='flex justify-between pt-1 gap-10'>
              <span className='text-gray-600 font-medium '>초성힌트</span>
              <span className='font-bold text-gray-800'>
                {GAME_DATA.initialConsonant}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-gray-300 p-3 text-center'>
        <p className='text-sm text-gray-700'>
          채팅창에
          <span className='font-semibold inline-block px-2 py-1 mx-1 bg-gray-400 text-white rounded'>
            .
          </span>
          하나만 입력하면 스킵투표가 됩니다.
        </p>
      </div>
    </div>
  );
};

export default MusicPlayer;
