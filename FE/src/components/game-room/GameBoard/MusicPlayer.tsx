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
  setVolume: (volume: number) => void;
  getVolume: () => number;
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoId, setVideoId] = useState<string>(GAME_DATA.youtubeId);

  console.log(isPlaying);

  useEffect(() => {
    if (youtubeUrl) {
      const extractedId = extractYouTubeVideoId(youtubeUrl);
      if (extractedId) {
        setVideoId(extractedId);
      }
    }
  }, [youtubeUrl]);

  const playerRef = useRef<YouTubePlayer | null>(null);

  useEffect(() => {
    const tag: HTMLScriptElement = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag: HTMLScriptElement | null =
      document.getElementsByTagName('script')[0];
    if (firstScriptTag?.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
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

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const onPlayerReady = (event: YouTubeEvent): void => {
    const defaultVolume = 100;
    event.target.setVolume(defaultVolume);

    event.target.playVideo();
    setIsPlaying(true);
  };

  const onPlayerStateChange = (event: YouTubeEvent): void => {
    if (event.data === window.YT.PlayerState.ENDED) {
      console.log('동영상 재생 완료');
    }
  };

  return (
    <div className='w-full h-full flex flex-col bg-gray-100 rounded-lg overflow-hidden max-w-lg mx-auto'>
      <div id='youtube-player' className='hidden'></div>

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
