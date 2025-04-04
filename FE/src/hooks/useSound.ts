import { useCallback, useEffect, useRef } from 'react';

interface SoundFile {
  key: string;
  url: string;
}

interface SoundControls {
  play: (key: string) => void;
  stop: () => void;
}

const useSound = (soundFiles: SoundFile[]): SoundControls => {
  const sounds = useRef<Record<string, HTMLAudioElement>>({});
  const currentPlaying = useRef<HTMLAudioElement | null>(null);

  // 사운드 파일 로드
  useEffect(() => {
    soundFiles.forEach(({ key, url }) => {
      if (!sounds.current[key]) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        sounds.current[key] = audio;
      }
    });

    // 컴포넌트 언마운트 시 클린업
    return () => {
      // 현재 재생 중인 사운드 중지
      if (currentPlaying.current) {
        currentPlaying.current.pause();
        currentPlaying.current.currentTime = 0;
        currentPlaying.current = null;
      }

      // 모든 오디오 요소 정리
      Object.values(sounds.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });

      sounds.current = {};
    };
  }, [soundFiles]);

  // 사운드 재생 함수
  const playSound = useCallback((key: string) => {
    const sound = sounds.current[key];
    if (sound) {
      if (currentPlaying.current) {
        currentPlaying.current.pause();
        currentPlaying.current.currentTime = 0;
      }

      currentPlaying.current = sound;
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error(`Error playing sound "${key}":`, error);
      });
    }
  }, []);

  // 현재 재생 중인 사운드 중지 함수
  const stopSound = useCallback(() => {
    if (currentPlaying.current) {
      currentPlaying.current.pause();
      currentPlaying.current.currentTime = 0;
      currentPlaying.current = null;
    }
  }, []);

  return { play: playSound, stop: stopSound };
};

export default useSound;
