import { useEffect } from 'react';

import useSound from '@/hooks/useSound';
import { useSoundEventStore } from '@/stores/useSoundEventStore';

import GameExitButton from '../GameExitButton';
import ScoreChatBox from '../ScoreChatBox';
import ScoreboardTable from './ScoreBoardTable';
import ScoreRoundInformation from './ScoreRoundInformation';

// 실제 경로로 수정해주세요

const ScoreMap = ({
  nickname,
  roomId,
  channelId,
}: {
  nickname: string;
  roomId: string;
  channelId: string;
}) => {
  const { soundEvent, setSoundEvent } = useSoundEventStore();
  const { play, stop } = useSound([
    { key: 'ROULETTE', url: '/audio/playsound/roulette.mp3' },
    { key: 'ROULETTE_RESULT', url: '/audio/playsound/roulette-result.mp3' },
    { key: 'CORRECT', url: '/audio/playsound/correct.mp3' },
    { key: 'WINNER', url: '/audio/playsound/winner.mp3' },
  ]);

  useEffect(() => {
    if (soundEvent) play(soundEvent);
    setSoundEvent(null);
  }, [soundEvent, play, setSoundEvent]);

  // 컴포넌트 언마운트 시 사운드 정리
  useEffect(() => {
    return () => {
      stop();
      setSoundEvent(null);
    };
  }, [stop, setSoundEvent]);

  return (
    <div className='relative flex h-full w-full'>
      <div className='relative flex w-[70%] flex-col gap-6 pt-10'>
        <div className='absolute top-2 right-4 z-10'>
          <GameExitButton />
        </div>

        <div className='mx-auto h-[300px] w-[60%]'>
          <ScoreRoundInformation />
        </div>

        <div className='h-[calc(100vh-380px)] w-full p-2'>
          <ScoreChatBox
            currentUserId={nickname}
            roomId={roomId}
            channelId={channelId}
          />
        </div>
      </div>

      <div className='relative h-full w-[30%] overflow-auto p-4'>
        <ScoreboardTable />
      </div>
    </div>
  );
};

export default ScoreMap;
