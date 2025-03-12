import SocketLayout from '@/components/layouts/SocketLayout';

import Header from '@/components/lobby/Header';
import RoomList from '@/components/lobby/RoomList';
import ChatBox from '@/components/lobby/ChatBox';
import CreateRoomButton from '@/components/lobby/CreateRoomButton';

export type Room = {
  id: string;
  name: string;
  isLocked: boolean;
  currentUsers: number;
  maxUsers: number;
  gameModes: string[];
};

const LobbyPage = () => {
  const rooms: Room[] = [
    {
      id: '1234',
      name: '즐거운 노래방',
      isLocked: false,
      currentUsers: 3,
      maxUsers: 8,
      gameModes: ['전곡 모드'],
    },
    {
      id: '2345',
      name: '가사 맞추기 대회',
      isLocked: false,
      currentUsers: 2,
      maxUsers: 4,
      gameModes: ['전곡 모드'],
    },
    {
      id: '3456',
      name: '아이돌 노래 전문',
      isLocked: true,
      currentUsers: 4,
      maxUsers: 6,
      gameModes: ['전곡 모드'],
    },
    {
      id: '4567',
      name: '트로트만 불러요',
      isLocked: false,
      currentUsers: 1,
      maxUsers: 8,
      gameModes: ['전곡 모드'],
    },
  ];

  return (
    <SocketLayout>
      <div className='flex flex-col h-screen bg-gray-100'>
        <Header />
        <div className='flex flex-1 overflow-hidden'>
          <div className='flex-1 p-6 flex flex-col'>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-bold text-gray-900'>게임 방 목록</h1>
              <CreateRoomButton />
            </div>

            <div className='flex-1 overflow-y-auto'>
              <RoomList rooms={rooms} />
            </div>
          </div>

          <div className='w-80 border-l border-gray-300 bg-white'>
            <ChatBox />
          </div>
        </div>
      </div>
    </SocketLayout>
  );
};

export default LobbyPage;
