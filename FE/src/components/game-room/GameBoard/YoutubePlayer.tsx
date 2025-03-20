import { useEffect, useRef } from 'react';

interface YoutubePlayerProps {
  url: string;
  onError?: (error: unknown) => void;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ url, onError }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Setup media session
    if (navigator?.mediaSession) {
      navigator.mediaSession.metadata = new MediaMetadata({});
    }

    // Play silent audio to keep the session active
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

  // Extract YouTube video ID from URL
  const getYoutubeId = (youtubeUrl: string): string => {
    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = youtubeUrl.match(regex);
    return match ? match[1] : '';
  };

  const videoId = getYoutubeId(url);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

  const handleIframeError = () => {
    if (onError) {
      onError(new Error('YouTube iframe failed to load'));
    }
  };

  return (
    <div className='pointer-events-none invisible fixed top-[-9999px] left-[-9999px] h-1 w-1 overflow-hidden opacity-0'>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width='1'
        height='1'
        allow='autoplay; encrypted-media'
        frameBorder='0'
        onError={handleIframeError}
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
