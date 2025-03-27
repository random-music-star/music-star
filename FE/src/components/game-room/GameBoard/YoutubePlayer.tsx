import { useEffect, useRef, useState } from 'react';

import { useGameScreenStore } from '@/stores/websocket/useGameScreenStore';

interface YoutubePlayerProps {
  url: string;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ url }) => {
  const remainTime = useGameScreenStore(state => state.remainTime);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerReadyRef = useRef<boolean>(false);
  const hasStartedRef = useRef<boolean>(false);
  const wasPlayingRef = useRef<boolean>(false);
  const [currentVideoId, setCurrentVideoId] = useState<string>('');

  // URL이 변경되면 비디오 ID 업데이트
  useEffect(() => {
    const videoId = getYoutubeId(url);
    if (videoId !== currentVideoId) {
      setCurrentVideoId(videoId);
      hasStartedRef.current = false;
      wasPlayingRef.current = false;
      playerReadyRef.current = false;
    }
  }, [url, currentVideoId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (navigator?.mediaSession) {
      navigator.mediaSession.metadata = new MediaMetadata({});
    }

    const blindSound = '/audio/noneSound.wav';
    const aud = new Audio(blindSound);
    aud.volume = 0;
    aud.loop = true;

    aud.play().catch(err => {
      console.warn('무음 오디오 재생 오류:', err);
    });

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        if (data.event === 'onReady') {
          playerReadyRef.current = true;
          checkAndPlayOrPause();
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      aud.pause();
      aud.src = '';
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'listening',
          id: currentVideoId,
        }),
        '*',
      );

      setTimeout(() => {
        if (!playerReadyRef.current) {
          playerReadyRef.current = true;
          checkAndPlayOrPause();
        }
      }, 1000);
    }
  };

  useEffect(() => {
    checkAndPlayOrPause();

    if (remainTime <= 0 && !hasStartedRef.current) {
      setTimeout(() => {
        if (!hasStartedRef.current && remainTime <= 0) {
          playerReadyRef.current = true;
          checkAndPlayOrPause();
        }
      }, 500);
    } else if (remainTime > 0 && wasPlayingRef.current) {
      setTimeout(() => {
        if (remainTime > 0 && wasPlayingRef.current) {
          pauseVideo();
        }
      }, 500);
    }
  }, [remainTime]);

  const checkAndPlayOrPause = () => {
    if (
      !iframeRef.current ||
      typeof window === 'undefined' ||
      !currentVideoId
    ) {
      return;
    }

    if (remainTime <= 0) {
      if (
        !hasStartedRef.current &&
        (playerReadyRef.current || document.readyState === 'complete')
      ) {
        playVideo();
      }
    } else {
      if (wasPlayingRef.current) {
        pauseVideo();
      }
    }
  };

  const playVideo = () => {
    hasStartedRef.current = true;
    wasPlayingRef.current = true;

    // 현재 시간 기록
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const milliseconds = now.getMilliseconds();
    console.log(`노래 재생 시작 시간: ${timeString}.${milliseconds}`);

    const commands = [
      JSON.stringify({
        event: 'command',
        func: 'playVideo',
        args: [],
      }),
      JSON.stringify({
        method: 'play',
      }),
      '{"event":"command","func":"playVideo","args":""}',
    ];

    commands.forEach(command => {
      iframeRef.current?.contentWindow?.postMessage(command, '*');
    });

    // 명령이 성공적으로 전송되었음을 로그에 기록
    console.log(`재생 명령 전송 완료: ${timeString}.${milliseconds}`);
  };

  const pauseVideo = () => {
    const commands = [
      JSON.stringify({
        event: 'command',
        func: 'pauseVideo',
        args: [],
      }),
      JSON.stringify({
        method: 'pause',
      }),
      '{"event":"command","func":"pauseVideo","args":""}',
    ];

    commands.forEach(command => {
      iframeRef.current?.contentWindow?.postMessage(command, '*');
    });
    wasPlayingRef.current = false;
  };

  const getYoutubeId = (youtubeUrl: string): string => {
    if (!youtubeUrl) return '';

    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = youtubeUrl.match(regex);
    return match ? match[1] : '';
  };

  if (!currentVideoId) {
    return null;
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=0&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&widgetid=1`;

  return (
    <div className='pointer-events-none invisible fixed top-[-9999px] left-[-9999px] h-1 w-1 overflow-hidden opacity-0'>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width='1'
        height='1'
        allow='autoplay; encrypted-media'
        onLoad={handleIframeLoad}
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
  );
};

export default YoutubePlayer;
