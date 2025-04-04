import React from 'react';

import { Lock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import {
  SelectedYearType,
  useGameInfoStore,
} from '@/stores/websocket/useGameRoomInfoStore';
import { MODE_DICT } from '@/stores/websocket/useGameRoundInfoStore';

import EditRoomButton from './EditRoomButton';

export type StatusConfig = {
  [key: string]: { text: string; color: string; bgColor: string };
};

export type FormatText = {
  [key: string]: { text: string; color: string; bgColor: string };
};

const yearMap: SelectedYearType[] = [
  2024, 2023, 2022, 2021, 2020, 2010, 2000, 1990, 1980, 1970,
];

const GameRoomInfo = () => {
  const { gameRoomInfo } = useGameInfoStore();
  const { participantInfo } = useParticipantInfoStore();

  if (!gameRoomInfo) return null;

  const {
    roomTitle,
    roomNumber,
    hasPassword,
    maxPlayer,
    maxGameRound,
    format,
    selectedYear,
    mode,
    status,
  } = gameRoomInfo;

  const statusConfig: StatusConfig = {
    WAITING: {
      text: '대기 중',
      color: 'text-blue-300',
      bgColor: 'bg-blue-950/40',
    },
    IN_PROGRESS: {
      text: '진행 중',
      color: 'text-green-300',
      bgColor: 'bg-green-950/40',
    },
    FINISHED: {
      text: '종료',
      color: 'text-gray-200',
      bgColor: 'bg-gray-800/40',
    },
  };

  const formatText: FormatText = {
    GENERAL: {
      text: '점수판',
      color: 'text-amber-300',
      bgColor: 'bg-amber-900/20',
    },
    BOARD: {
      text: '보드판',
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-900/20',
    },
  };

  const currentStatus = status ? statusConfig[status] : statusConfig.WAITING;
  const currentFormat = formatText[format];

  return (
    <div className='h-full min-h-[250px] w-full p-2 backdrop-blur-sm'>
      <div className='flex h-full w-full flex-col gap-6 rounded-xl border border-purple-400 bg-purple-800/20 p-4'>
        <div className='flex items-center justify-between border-b border-purple-700 pb-3'>
          <div className='flex items-center'>
            <div className='text-md mr-2 rounded-md bg-purple-500/60 px-3 py-1.5 font-bold text-purple-100'>
              {String(roomNumber).padStart(3, '0')}
            </div>
            <h2 className='text-center text-xl font-extrabold text-purple-100'>
              {roomTitle || '방 정보'}
            </h2>
            {hasPassword && (
              <Lock className='mb-[1px] ml-2 h-5 w-5 text-yellow-200' />
            )}
          </div>
          <div className='flex'>
            <div
              className={`flex items-center rounded-full px-3 py-1 ${currentStatus.bgColor} ${currentStatus.color} text-xs font-medium`}
            >
              {currentStatus.text}
            </div>
            <EditRoomButton />
          </div>
        </div>

        <div className='flex h-full justify-between gap-4'>
          <div className='flex flex-1 flex-col justify-between space-y-4'>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-md mr-2 font-medium text-cyan-200'>
                인원
              </span>
              <span className='text-lg font-semibold text-white'>
                {participantInfo.length} / {maxPlayer}명
              </span>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-md mr-2 font-medium text-pink-200'>
                라운드
              </span>
              <span className='text-lg font-semibold text-white'>
                {maxGameRound}회
              </span>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-md mr-2 font-medium text-lime-200'>맵</span>
              <span
                className={`inline-block rounded-md px-2 py-1 text-sm ${currentFormat.bgColor} ${currentFormat.color} font-medium`}
              >
                {currentFormat.text}
              </span>
            </div>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex gap-1'>
                <span className='text-md mr-1 w-[45px] font-medium text-purple-200'>
                  모드
                </span>
                <div className='flex flex-wrap gap-2'>
                  {mode.map((m, index) => (
                    <span
                      key={`mode-${index}`}
                      className='inline-block rounded-full border border-fuchsia-400/50 bg-fuchsia-900/30 px-2 py-1 text-xs text-fuchsia-200 shadow-sm'
                    >
                      {MODE_DICT[m]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col items-center gap-1 border-l border-purple-700 pl-4'>
            <span className='mb-1 text-xs font-medium text-gray-400'>연도</span>
            <div className='grid grid-cols-2 gap-1'>
              {yearMap.map(year => (
                <span
                  className={cn(
                    `rounded-lg border px-2 py-[2px] text-sm transition-all duration-200`,
                    selectedYear.includes(year)
                      ? 'border-cyan-400 bg-cyan-600/20 text-cyan-300 shadow-sm shadow-cyan-900/50'
                      : 'border-cyan-400/20 bg-cyan-900/10 text-cyan-300/30',
                  )}
                  key={year}
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
