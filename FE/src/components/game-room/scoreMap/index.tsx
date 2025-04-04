import { useEffect } from 'react';

import useSound from '@/hooks/useSound';
import { useSoundEventStore } from '@/stores/useSoundEventStore';

import ScoreChatBox from '../ScoreChatBox';
import ScoreboardTable from './ScoreBoardTable';
import ScoreRoundInformation from './ScoreRoundInformation';

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
  ]);

  useEffect(() => {
    if (soundEvent) play(soundEvent);
    setSoundEvent(null);
  }, [soundEvent, play, setSoundEvent]);

  useEffect(() => {
    return () => {
      stop();
      setSoundEvent(null);
    };
  }, [stop, setSoundEvent]);

  return (
    <div className='flex h-full w-full'>
      <div className='flex w-[70%] flex-col pt-10'>
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

      <div className='h-full w-[30%] overflow-auto p-4'>
        <ScoreboardTable />
      </div>
    </div>
  );
};

export default ScoreMap;
