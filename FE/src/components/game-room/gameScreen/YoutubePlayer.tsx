import { useEffect, useRef, useState } from 'react';

import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

const YoutubePlayer = () => {
  const url = useGameRoundInfoStore(state => state.roundInfo.songUrl);
  const url2 = useGameRoundInfoStore(state => state.roundInfo.songUrl2);

  const roomInfo = useGameInfoStore(state => state.gameRoomInfo?.status);

  const roundState = useGameStateStore(state => state.gameState);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframe2Ref = useRef<HTMLIFrameElement>(null);
  const playerReadyRef = useRef<boolean>(false);
  const player2ReadyRef = useRef<boolean>(false);
  const hasStartedRef = useRef<boolean>(false);
  const hasStarted2Ref = useRef<boolean>(false);
  const wasPlayingRef = useRef<boolean>(false);
  const wasPlaying2Ref = useRef<boolean>(false);
  const [currentVideoId, setCurrentVideoId] = useState<string>('');
  const [currentVideoId2, setCurrentVideoId2] = useState<string>('');

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
    if (!url2) {
      setCurrentVideoId2('');
      hasStarted2Ref.current = false;
      wasPlaying2Ref.current = false;
      player2ReadyRef.current = false;
      return;
    }

    const videoId2 = getYoutubeId(url2);
    if (videoId2 && videoId2 !== currentVideoId2) {
      setCurrentVideoId2(videoId2);

      hasStarted2Ref.current = false;
      wasPlaying2Ref.current = false;
      player2ReadyRef.current = false;

      setTimeout(() => {
        pauseVideo2();
      }, 500);
    }
  }, [url2, currentVideoId2]);

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
          // Check which player is ready based on the event data
          if (data.id === currentVideoId) {
            playerReadyRef.current = true;
            checkAndPlayOrPause();
          } else if (data.id === currentVideoId2) {
            player2ReadyRef.current = true;
            checkAndPlayOrPause2();
          }
        } else if (data.event === 'onStateChange') {
          // Handle state changes for both players
          if (data.id === currentVideoId && data.info === 1) {
            hasStartedRef.current = true;
            wasPlayingRef.current = true;
          } else if (data.id === currentVideoId2 && data.info === 1) {
            hasStarted2Ref.current = true;
            wasPlaying2Ref.current = true;
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
  }, [currentVideoId, currentVideoId2]);

  useEffect(() => {
    if (currentVideoId && !playerReadyRef.current) {
      playerReadyRef.current = true;

      if (
        roundState === 'ROUND_INFO' ||
        roundState === 'ROUND_OPEN' ||
        roomInfo === 'WAITING'
      ) {
        pauseVideo();
      }
    }
  }, [currentVideoId, roundState, roomInfo]);

  useEffect(() => {
    if (currentVideoId2 && !player2ReadyRef.current) {
      player2ReadyRef.current = true;

      if (
        roundState === 'ROUND_INFO' ||
        roundState === 'ROUND_OPEN' ||
        roomInfo === 'WAITING'
      ) {
        pauseVideo2();
      }
    }
  }, [currentVideoId2, roundState, roomInfo]);

  // 추가된 useEffect - roomInfo가 변경될 때 처리
  useEffect(() => {
    if (roomInfo === 'WAITING') {
      pauseVideo();
      pauseVideo2();
      hasStartedRef.current = false;
      hasStarted2Ref.current = false;
      wasPlayingRef.current = false;
      wasPlaying2Ref.current = false;
    }
  }, [roomInfo]);

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

  const handleIframe2Load = () => {
    if (iframe2Ref.current && iframe2Ref.current.contentWindow) {
      iframe2Ref.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'listening',
          id: currentVideoId2,
        }),
        '*',
      );

      player2ReadyRef.current = true;
      pauseVideo2();
    }
  };

  useEffect(() => {
    if (
      roundState === 'ROUND_INFO' ||
      roundState === 'ROUND_OPEN' ||
      roomInfo === 'WAITING'
    ) {
      pauseVideo();
      pauseVideo2();
      hasStartedRef.current = false;
      hasStarted2Ref.current = false;
      wasPlayingRef.current = false;
      wasPlaying2Ref.current = false;
    } else {
      if (!wasPlayingRef.current) {
        playVideo();
      }
      if (currentVideoId2 && !wasPlaying2Ref.current) {
        playVideo2();
      }
    }
  }, [roundState, currentVideoId2, roomInfo]);

  const checkAndPlayOrPause = () => {
    if (
      !iframeRef.current ||
      typeof window === 'undefined' ||
      !currentVideoId
    ) {
      return;
    }

    if (
      roundState === 'ROUND_INFO' ||
      roundState === 'ROUND_OPEN' ||
      roomInfo === 'WAITING'
    ) {
      pauseVideo();
    } else {
      if (!wasPlayingRef.current) {
        playVideo();
      }
    }
  };

  const checkAndPlayOrPause2 = () => {
    if (
      !iframe2Ref.current ||
      typeof window === 'undefined' ||
      !currentVideoId2
    ) {
      return;
    }

    if (
      roundState === 'ROUND_INFO' ||
      roundState === 'ROUND_OPEN' ||
      roomInfo === 'WAITING'
    ) {
      pauseVideo2();
    } else {
      if (!wasPlaying2Ref.current) {
        playVideo2();
      }
    }
  };

  const playVideo = () => {
    if (wasPlayingRef.current) return; // 이미 재생 중이면 무시

    if (
      roundState === 'ROUND_INFO' ||
      roundState === 'ROUND_OPEN' ||
      roomInfo === 'WAITING'
    ) {
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
        '{"event":"command","func":"setVolume","args":[25]}',
        '*',
      );
      iframeRef.current.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        '*',
      );
    }
  };

  const playVideo2 = () => {
    if (wasPlaying2Ref.current || !currentVideoId2) return; // 이미 재생 중이거나 URL2가 없으면 무시

    if (
      roundState === 'ROUND_INFO' ||
      roundState === 'ROUND_OPEN' ||
      roomInfo === 'WAITING'
    ) {
      return;
    }

    hasStarted2Ref.current = true;
    wasPlaying2Ref.current = true;

    if (iframe2Ref.current?.contentWindow) {
      iframe2Ref.current.contentWindow.postMessage(
        '{"event":"command","func":"unMute","args":""}',
        '*',
      );
      iframe2Ref.current.contentWindow.postMessage(
        '{"event":"command","func":"setVolume","args":[25]}',
        '*',
      );
      iframe2Ref.current.contentWindow.postMessage(
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

  const pauseVideo2 = () => {
    if (!currentVideoId2) return; // URL2가 없으면 무시

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
      iframe2Ref.current?.contentWindow?.postMessage(command, '*');
    });

    wasPlaying2Ref.current = false;
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

  // songUrl2가 있을 경우 두 영상 모두 30초부터 시작, 없으면 첫 번째 영상만 0초부터 시작
  const startTime = currentVideoId2 ? 30 : 0;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&mute=0&start=${startTime}&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&widgetid=1`;

  const embedUrl2 = currentVideoId2
    ? `https://www.youtube-nocookie.com/embed/${currentVideoId2}?autoplay=1&mute=0&start=30&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&widgetid=2`
    : '';

  return (
    <div className='pointer-events-none invisible fixed top-[-9999px] left-[-9999px] h-1 w-1 overflow-hidden opacity-0'>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width='1'
        height='1'
        allow='autoplay; encrypted-media'
        onLoad={handleIframeLoad}
        title='YouTube music player 1'
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
      {currentVideoId2 && (
        <iframe
          ref={iframe2Ref}
          src={embedUrl2}
          width='1'
          height='1'
          allow='autoplay; encrypted-media'
          onLoad={handleIframe2Load}
          title='YouTube music player 2'
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
      )}
    </div>
  );
};

export default YoutubePlayer;
