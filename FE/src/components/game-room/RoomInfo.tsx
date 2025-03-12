// pages/game-room/_components/RoomInfo.tsx
import { Room } from '../../_types/game';
import { Lock, Unlock, Users } from 'lucide-react';

interface RoomInfoProps {
  room: Room;
}

export default function RoomInfo({ room }: RoomInfoProps) {
  return (
    <div className='flex-1 p-4'>
      {/* 방 보안 상태 및 방 이름 그룹화 */}
      <div className='mb-4'>
        <div className='flex items-center text-lg font-semibold mb-2'>
          {room.isPrivate ? (
            <div className='flex items-center text-amber-600'>
              <Lock className='mr-2' size={18} />
              <span>비공개 방</span>
            </div>
          ) : (
            <div className='flex items-center text-green-600'>
              <Unlock className='mr-2' size={18} />
              <span>공개 방</span>
            </div>
          )}
        </div>

        {/* 방 이름 */}
        <div className='p-3 bg-gray-100 rounded-lg shadow-inner'>
          <h3 className='text-gray-500 text-xs font-semibold mb-1'>방 이름</h3>
          <p className='text-lg font-bold text-gray-800'>{room.name}</p>
        </div>
      </div>

      {/* 참가자 수 - 콤팩트하게 */}
      <div className='mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
        <div className='flex items-center justify-between'>
          <h3 className='text-blue-600 text-xs font-semibold'>참가자</h3>
          <div className='flex items-center'>
            <Users size={16} className='mr-1 text-blue-600' />
            <span className='text-blue-700 font-bold'>
              {room.currentPlayers}/{room.maxPlayers}
            </span>
          </div>
        </div>
      </div>

      {/* 게임 정보 */}
      <div className='mb-4'>
        <h3 className='text-gray-500 text-xs font-semibold mb-2'>게임 정보</h3>

        {/* 게임 연도 라벨 */}
        <div className='mb-3'>
          <p className='text-xs text-gray-600 mb-1'>게임 연도</p>
          <div className='flex gap-1 flex-wrap'>
            {room.gameYears.map(year => (
              <span
                key={year}
                className='inline-block px-2 py-1 bg-blue-500 text-white rounded-md text-xs font-medium'
              >
                {year}
              </span>
            ))}
          </div>
        </div>

        {/* 게임 모드 라벨 */}
        <div>
          <p className='text-xs text-gray-600 mb-1'>게임 모드</p>
          <div className='flex gap-1 flex-wrap'>
            {room.gameModes.map(mode => (
              <span
                key={mode}
                className='inline-block px-2 py-1 bg-purple-500 text-white rounded-md text-xs font-medium'
              >
                {mode}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 방 코드 (비공개 방인 경우) */}
      {room.isPrivate && (
        <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
          <h3 className='text-amber-600 text-xs font-semibold mb-1'>방 코드</h3>
          <p className='text-center font-mono text-xl font-bold tracking-widest text-amber-700'>
            {room.roomCode}
          </p>
          <p className='text-center text-xs text-amber-600 mt-1'>
            친구들과 공유하세요
          </p>
        </div>
      )}
    </div>
  );
}
