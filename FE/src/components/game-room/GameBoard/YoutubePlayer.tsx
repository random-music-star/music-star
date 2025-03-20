import { useEffect, useRef } from 'react';

import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface YoutubePlayerProps {
  url: string;
  onError?: (error: unknown) => void;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ url, onError }) => {
  const playerRef = useRef(null);

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

    return () => {
      aud.pause();
      aud.src = '';
    };
  }, []);

  return (
    <div className='pointer-events-none invisible fixed top-[-9999px] left-[-9999px] h-1 w-1 overflow-hidden opacity-0'>
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={true}
        controls={false}
        width='1px'
        height='1px'
        volume={1}
        muted={false}
        onError={onError}
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
              origin:
                typeof window !== 'undefined' ? window.location.origin : '',
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
  );
};

export default YoutubePlayer;
