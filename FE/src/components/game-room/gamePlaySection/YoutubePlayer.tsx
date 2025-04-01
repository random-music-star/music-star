import { useEffect, useRef, useState } from 'react';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

const YoutubePlayer = () => {
  const url = useGameRoundInfoStore(state => state.roundInfo.songUrl);
  const roundState = useGameStateStore(state => state.gameState);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerReadyRef = useRef<boolean>(false);
  const hasStartedRef = useRef<boolean>(false);
  const wasPlayingRef = useRef<boolean>(false);
  const [currentVideoId, setCurrentVideoId] = useState<string>('');

  useEffect(() => {
    if (!url) return;
    const videoId = getYoutubeId(url);
    if (videoId && videoId !== currentVideoId) {
      setCurrentVideoId(videoId);

      hasStartedRef.current = false;
      wasPlayingRef.current = false;
      playerReadyRef.current = false;

      setTimeout(() => {
        pauseVideo();
      }, 500);
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
    aud.play();

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        if (data.event === 'onReady') {
          playerReadyRef.current = true;
          checkAndPlayOrPause();
        } else if (data.event === 'onStateChange') {
          if (data.info === 1) {
            hasStartedRef.current = true;
            wasPlayingRef.current = true;
          }
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

  useEffect(() => {
    if (currentVideoId && !playerReadyRef.current) {
      playerReadyRef.current = true;

      if (roundState === 'ROUND_INFO' || roundState === 'ROUND_OPEN') {
        pauseVideo();
      }
    }
  }, [currentVideoId, roundState]);

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'listening',
          id: currentVideoId,
        }),
        '*',
      );

      playerReadyRef.current = true;
      pauseVideo();
    }
  };

  useEffect(() => {
    if (roundState === 'ROUND_INFO' || roundState === 'ROUND_OPEN') {
      pauseVideo();
      hasStartedRef.current = false;
      wasPlayingRef.current = false;
    } else {
      if (!wasPlayingRef.current) {
        playVideo();
      }
    }
  }, [roundState]);

  const checkAndPlayOrPause = () => {
    if (
      !iframeRef.current ||
      typeof window === 'undefined' ||
      !currentVideoId
    ) {
      return;
    }

    if (roundState === 'ROUND_INFO' || roundState === 'ROUND_OPEN') {
      pauseVideo();
    } else {
      if (!wasPlayingRef.current) {
        playVideo();
      }
    }
  };

  const playVideo = () => {
    if (wasPlayingRef.current) return; // 이미 재생 중이면 무시

    if (roundState === 'ROUND_INFO' || roundState === 'ROUND_OPEN') {
      return;
    }

    hasStartedRef.current = true;
    wasPlayingRef.current = true;

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        '{"event":"command","func":"unMute","args":""}',
        '*',
      );
      iframeRef.current.contentWindow.postMessage(
        '{"event":"command","func":"setVolume","args":[100]}',
        '*',
      );
      iframeRef.current.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        '*',
      );
    }
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

  const getYoutubeId = (youtubeUrl: string) => {
    if (!youtubeUrl) return '';

    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = youtubeUrl.match(regex);
    return match ? match[1] : '';
  };

  if (!currentVideoId) {
    return null;
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&mute=0&start=0&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&widgetid=1`;

  return (
    <div className='pointer-events-none invisible fixed top-[-9999px] left-[-9999px] h-1 w-1 overflow-hidden opacity-0'>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width='1'
        height='1'
        allow='autoplay; encrypted-media'
        onLoad={handleIframeLoad}
        title='YouTube music player'
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
