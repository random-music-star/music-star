import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface BackgroundMusicProps {
  pageType: 'home' | 'lobby' | 'waitingRoom';
}

const BackgroundMusic = ({ pageType }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMusic, setCurrentMusic] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(true);

  // 페이지에 따른 음악 파일 선택 로직
  const getMusicForCurrentPage = () => {
    switch (pageType) {
      case 'home':
        return '/music/lobby-music.mp3';
      case 'lobby':
        return '/music/waiting-room-music.mp3';
      case 'waitingRoom':
        return '/music/lobby-music.mp3';
      default:
        return '/music/waiting-room-music.mp3';
    }
  };

  // 페이지 변경 시 음악 파일 업데이트
  useEffect(() => {
    const musicPath = getMusicForCurrentPage();
    setCurrentMusic(musicPath);
  }, [pageType]);

  // 3초 후 툴팁 숨기기
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 위쪽 화살표 키: 음악 켜기
      if (event.key === 'ArrowUp') {
        setIsMuted(false);
        setShowTooltip(false);
      }
      // 아래쪽 화살표 키: 음악 끄기
      else if (event.key === 'ArrowDown') {
        setIsMuted(true);
        setShowTooltip(false);
      }
    };

    // 이벤트 리스너 추가
    window.addEventListener('keydown', handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 음악 재생 로직
  useEffect(() => {
    if (!audioRef.current) return;

    if (!isMuted && !isPlaying) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else if (isMuted && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    audioRef.current.muted = isMuted;
  }, [isMuted, isPlaying]);

  // 음악 파일 변경 처리
  useEffect(() => {
    if (!audioRef.current || !currentMusic) return;

    if (audioRef.current.src !== window.location.origin + currentMusic) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = currentMusic;

      if (wasPlaying && !isMuted) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentMusic, isMuted]);

  // 음소거 토글 함수
  const toggleMute = () => {
    setIsMuted(!isMuted);
    setShowTooltip(false);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentMusic}
        loop
        preload='auto'
        muted={isMuted}
      />

      <div className='fixed bottom-5 left-5 z-50 flex flex-col-reverse items-start space-y-4'>
        <button
          onClick={toggleMute}
          className='rounded-full bg-black/50 p-3 text-white transition-all hover:bg-black/70'
          aria-label={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className='mb-1 ml-8 rounded-lg bg-black/70 px-4 py-2 text-sm whitespace-nowrap text-white'
            >
              배경 음악을 켜보세요! (🔼 위 방향키: 음악 켜기, 🔽 아래 방향키:
              음악 끄기)
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BackgroundMusic;
