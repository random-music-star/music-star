import Image from 'next/image';

import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';

import RoomInfo from './RoomInfo';

const RoomPannel = () => {
  const { gameRoomInfo } = useGameInfoStore();

  if (!gameRoomInfo) return;

  return (
    <div className='relative aspect-square w-full'>
      <div className='relative h-full w-full'>
        <Image
          src='/box.svg'
          alt='Room background'
          fill
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          priority
          className='z-0 object-contain'
        />
      </div>

      <div className='absolute inset-0 z-10 flex flex-col items-center justify-center'>
        <RoomInfo />
      </div>
    </div>
  );
};

export default RoomPannel;
