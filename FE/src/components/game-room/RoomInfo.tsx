import { Award, Clock, LayoutGrid, Lock, Unlock, Users } from 'lucide-react';

import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';

export interface StatusConfig {
  [key: string]: {
    text: string;
    color: string;
  };
}

export interface FormatText {
  [key: string]: string;
}

export default function RoomInfo() {
  const { gameRoomInfo } = useGameInfoStore();

  if (!gameRoomInfo) return;

  const {
    roomTitle,
    hasPassword,
    maxPlayer,
    maxGameRound,
    format,
    selectedYear,
    mode,
    status,
  } = gameRoomInfo;

  const statusConfig: StatusConfig = {
    WAITING: { text: '대기 중', color: 'text-blue-600' },
    IN_PROGRESS: { text: '게임 진행 중', color: 'text-green-600' },
    FINISHED: { text: '종료됨', color: 'text-gray-600' },
  };

  const formatText: FormatText = {
    GENERAL: '일반',
    BOARD: '보드',
  };

  return (
    <div className='flex w-1/4 flex-col overflow-hidden rounded-xl bg-white shadow-lg'>
      <div className='bg-indigo-600 p-4 font-bold text-white'>
        <h2>방 정보</h2>
      </div>
      <div className='rounded-lg bg-white p-3 shadow-sm'>
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center'>
            {hasPassword ? (
              <Lock className='mr-2 text-amber-500' size={16} />
            ) : (
              <Unlock className='mr-2 text-green-500' size={16} />
            )}
            <h2 className='font-bold text-gray-800'>
              {roomTitle || '방 이름 없음'}
            </h2>
          </div>
          <div
            className={`rounded px-2 py-0.5 text-xs font-medium ${statusConfig[status]?.color || 'text-gray-600'}`}
          >
            {statusConfig[status]?.text || '상태 없음'}
          </div>
        </div>

        <div className='mb-2 grid grid-cols-2 gap-2 text-sm'>
          <div className='flex items-center'>
            <Users size={14} className='mr-1.5 text-blue-500' />
            <span className='text-gray-600'>최대 {maxPlayer || '?'} 명</span>
          </div>

          <div className='flex items-center'>
            <Award size={14} className='mr-1.5 text-purple-500' />
            <span className='text-gray-600'>{maxGameRound || '?'} 라운드</span>
          </div>

          <div className='flex items-center'>
            <LayoutGrid size={14} className='mr-1.5 text-teal-500' />
            <span className='text-gray-600'>
              {formatText[format] || format || '?'} 모드
            </span>
          </div>

          <div className='flex items-center'>
            <Clock size={14} className='mr-1.5 text-indigo-500' />
            <span className='text-gray-600'>
              {selectedYear && selectedYear.length > 0
                ? `${Math.min(...selectedYear)}~${Math.max(...selectedYear)}`
                : '모든 연도'}
            </span>
          </div>
        </div>

        <div className='mt-3'>
          {mode && mode.length > 0 && (
            <div className='mb-2 flex flex-wrap gap-1'>
              {mode.map(gameMode => (
                <span
                  key={gameMode}
                  className='inline-block rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700'
                >
                  {gameMode}
                </span>
              ))}
            </div>
          )}

          {selectedYear && selectedYear.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {selectedYear.map(year => (
                <span
                  key={year}
                  className='inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700'
                >
                  {year}
                </span>
              ))}
            </div>
          )}
        </div>

        {hasPassword && (
          <div className='mt-3 border-t border-gray-100 pt-2'>
            <div className='flex items-center justify-between'>
              <span className='text-xs text-amber-600'>방 코드:</span>
              <span className='font-mono font-medium text-amber-700'></span>
            </div>
          </div>
        )}
        {/* <EditRoomButton /> */}
      </div>
    </div>
  );
}
