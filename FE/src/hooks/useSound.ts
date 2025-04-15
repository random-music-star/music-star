import { useCallback, useRef } from 'react';

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

  // 컴포넌트 본문에서 직접 초기화 (작동하는 버전과 동일)
  soundFiles.forEach(({ key, url }) => {
    if (!sounds.current[key]) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.05;
      sounds.current[key] = audio;
    }
  });

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
