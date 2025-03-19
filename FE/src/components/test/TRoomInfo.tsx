import React from 'react';

import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';

export type StatusConfig = {
  [key: string]: { text: string; color: string };
};

export type FormatText = {
  [key: string]: string;
};

const GameRoomInfo = () => {
  const { gameRoomInfo } = useGameInfoStore();

  if (!gameRoomInfo) return null;

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

  // 밝은 형광색으로 변경
  const statusConfig: StatusConfig = {
    WAITING: { text: '대기 중', color: 'text-blue-300' },
    IN_PROGRESS: { text: '게임 진행 중', color: 'text-green-300' },
    FINISHED: { text: '종료됨', color: 'text-gray-200' },
  };

  const formatText: FormatText = {
    GENERAL: '일반',
    BOARD: '보드',
  };

  const currentPlayers = 4; // 실제 데이터에 맞게 수정 필요

  const modeArray = Array.isArray(mode) ? mode : [mode];
  const yearArray = Array.isArray(selectedYear) ? selectedYear : [selectedYear];

  return (
    <div className='h-full w-full p-6'>
      <div className='flex h-full w-full flex-col rounded-lg px-6 py-4'>
        {/* 밝은 형광색 타이틀 */}
        <h2 className='mb-3 text-center text-2xl font-bold text-fuchsia-300'>
          {roomTitle || '방 정보'}
        </h2>

        <div className='mb-4 flex items-center justify-center gap-2'>
          <span
            className={`rounded-md px-3 py-1 font-medium ${statusConfig[status].color}`}
          >
            {statusConfig[status].text}
          </span>
          {!hasPassword && (
            <span className='flex items-center rounded-md px-3 py-1 font-medium text-yellow-200'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mr-1 h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                />
              </svg>
              비밀방
            </span>
          )}
        </div>

        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-4'>
            <span className='font-medium text-cyan-200'>인원:</span>
            <span className='font-medium text-white'>
              {currentPlayers}/{maxPlayer}명
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <span className='font-medium text-pink-200'>라운드:</span>
            <span className='font-medium text-white'>{maxGameRound}회</span>
          </div>
          <div className='flex items-center gap-4'>
            <span className='font-medium text-lime-200'>포맷:</span>
            <span className='font-medium text-white'>{formatText[format]}</span>
          </div>
          <div className='flex items-center gap-4'>
            <span className='mb-1 block font-medium text-purple-200'>
              모드:
            </span>
            <div className='flex flex-wrap gap-2'>
              {modeArray.map((m, index) => (
                <span
                  key={`mode-${index}`}
                  className='inline-block rounded-full bg-purple-900/20 px-3 py-1 text-sm font-medium text-purple-200'
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <span className='mb-1 block font-medium text-yellow-200'>
              연도:
            </span>
            <div className='flex flex-wrap gap-2'>
              {yearArray.map((year, index) => (
                <span
                  key={`year-${index}`}
                  className='inline-block rounded-full bg-yellow-900/20 px-3 py-1 text-sm font-medium text-yellow-200'
                >
                  {year}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoomInfo;
