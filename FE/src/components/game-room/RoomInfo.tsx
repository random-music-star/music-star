// types/websocket.ts
export type RoomStatus = 'WAITING' | 'FINISHED' | 'IN_PROGRESS';
export type GameFormat = 'GENERAL' | 'BOARD';
export type Mode = 'NORMAL' | 'SPEED' | 'HINT' | 'TIME_ATTACK' | string;

export interface GameInfoStore {
  gameRoomInfo: GameInfoState;
  setGameInfo: (newGameRoomInfo: GameInfoState) => void;
}

// 상태 구성 인터페이스
export interface StatusConfig {
  [key: string]: {
    text: string;
    color: string;
  };
}

// 게임 형식 텍스트 인터페이스
export interface FormatText {
  [key: string]: string;
}

import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { GameInfoState } from '@/types/websocket';
import { Lock, Unlock, Users, Clock, LayoutGrid, Award } from 'lucide-react';

export default function RoomInfo() {
  const { gameRoomInfo } = useGameInfoStore();

  const defaultData: GameInfoState = {
    roomTitle: '즐거운 K-POP 맞추기',
    password: 'ABC123',
    maxPlayer: 8,
    maxGameRound: 10,
    format: 'GENERAL',
    selectedYear: [2020, 2021, 2022],
    mode: ['FULL'],
    status: 'WAITING',
  };

  // gameRoomInfo가 비어있는지 확인
  const isEmpty = !gameRoomInfo || Object.keys(gameRoomInfo).length === 0;

  // 실제 사용할 데이터
  const {
    roomTitle,
    password,
    maxPlayer,
    maxGameRound,
    format,
    selectedYear,
    mode,
    status,
  } = isEmpty ? defaultData : gameRoomInfo;

  // 방 상태에 따른 스타일 및 텍스트 설정
  const statusConfig: StatusConfig = {
    WAITING: { text: '대기 중', color: 'text-blue-600' },
    IN_PROGRESS: { text: '게임 진행 중', color: 'text-green-600' },
    FINISHED: { text: '종료됨', color: 'text-gray-600' },
  };

  // 방 형식 텍스트 변환
  const formatText: FormatText = {
    GENERAL: '일반',
    BOARD: '보드',
  };

  // 비공개 방 여부 (roomNumber 기준으로 판단)
  const isPrivate = password && password.length > 0;

  return (
    <div className='p-3 bg-white rounded-lg shadow-sm'>
      {/* 헤더: 방 이름과 상태 */}
      <div className='flex justify-between items-center mb-3'>
        <div className='flex items-center'>
          {isPrivate ? (
            <Lock className='text-amber-500 mr-2' size={16} />
          ) : (
            <Unlock className='text-green-500 mr-2' size={16} />
          )}
          <h2 className='font-bold text-gray-800'>
            {roomTitle || '방 이름 없음'}
          </h2>
        </div>
        <div
          className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[status]?.color || 'text-gray-600'}`}
        >
          {statusConfig[status]?.text || '상태 없음'}
        </div>
      </div>

      {/* 방 정보 그리드 */}
      <div className='grid grid-cols-2 gap-2 text-sm mb-2'>
        {/* 참가자 수 */}
        <div className='flex items-center'>
          <Users size={14} className='text-blue-500 mr-1.5' />
          <span className='text-gray-600'>최대 {maxPlayer || '?'} 명</span>
        </div>

        {/* 라운드 수 */}
        <div className='flex items-center'>
          <Award size={14} className='text-purple-500 mr-1.5' />
          <span className='text-gray-600'>{maxGameRound || '?'} 라운드</span>
        </div>

        {/* 게임 형식 */}
        <div className='flex items-center'>
          <LayoutGrid size={14} className='text-teal-500 mr-1.5' />
          <span className='text-gray-600'>
            {formatText[format] || format || '?'} 모드
          </span>
        </div>

        {/* 연도 범위 */}
        <div className='flex items-center'>
          <Clock size={14} className='text-indigo-500 mr-1.5' />
          <span className='text-gray-600'>
            {selectedYear && selectedYear.length > 0
              ? `${Math.min(...selectedYear)}~${Math.max(...selectedYear)}`
              : '모든 연도'}
          </span>
        </div>
      </div>

      {/* 태그 영역 */}
      <div className='mt-3'>
        {/* 게임 모드 태그 */}
        {mode && mode.length > 0 && (
          <div className='flex flex-wrap gap-1 mb-2'>
            {mode.map(gameMode => (
              <span
                key={gameMode}
                className='inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs'
              >
                {gameMode}
              </span>
            ))}
          </div>
        )}

        {/* 연도 태그 */}
        {selectedYear && selectedYear.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {selectedYear.map(year => (
              <span
                key={year}
                className='inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs'
              >
                {year}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 방 코드 (비공개 방인 경우) */}
      {isPrivate && (
        <div className='mt-3 pt-2 border-t border-gray-100'>
          <div className='flex justify-between items-center'>
            <span className='text-xs text-amber-600'>방 코드:</span>
            <span className='font-mono font-medium text-amber-700'>
              {password}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
