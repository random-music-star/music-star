import { useCallback, useRef } from 'react';

interface SoundFile {
  key: string;
  url: string;
}

export type PlaySound = (key: string) => void;

const useSound = (soundFiles: SoundFile[]): PlaySound => {
  const sounds = useRef<Record<string, HTMLAudioElement>>({});
  const currentPlaying = useRef<HTMLAudioElement | null>(null);

  soundFiles.forEach(({ key, url }) => {
    if (!sounds.current[key]) {
      const audio = new Audio(url);
      audio.preload = 'auto';
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

  return playSound;
};

export default useSound;
