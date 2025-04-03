import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ParticipantInfo,
  useParticipantInfoStore,
} from '@/stores/websocket/useGameParticipantStore';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { MODE_DICT } from '@/stores/websocket/useGameRoundInfoStore';

import ScoreChatBox from '../ScoreChatBox';

interface ScoreWaitingPanelProps {
  currentUserId: string;
  handleStartGame: () => void;
  roomId: string;
  channelId: string;
}

// 상태 설정 타입
type StatusConfig = {
  [key: string]: { text: string; color: string };
};

const ScoreWaitingPanel = ({
  currentUserId,
  handleStartGame,
  roomId,
  channelId,
}: ScoreWaitingPanelProps) => {
  const { gameRoomInfo } = useGameInfoStore();
  const { participantInfo, hostNickname } = useParticipantInfoStore();

  const isHost = currentUserId === hostNickname;

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;
  const colsPerPage = 5;
  const participantsPerPage = rowsPerPage * colsPerPage;

  const totalPages = Math.ceil(participantInfo.length / participantsPerPage);

  const currentParticipants = participantInfo.slice(
    (currentPage - 1) * participantsPerPage,
    currentPage * participantsPerPage,
  );

  const displayParticipants: (null | ParticipantInfo)[] = [
    ...currentParticipants,
  ];
  for (let i = currentParticipants.length; i < participantsPerPage; i++) {
    displayParticipants.push(null);
  }

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const statusConfig: StatusConfig = {
    WAITING: { text: '대기 중', color: 'text-purple-100 bg-purple-800' },
    IN_PROGRESS: {
      text: '게임 진행 중',
      color: 'text-green-100 bg-purple-900',
    },
    FINISHED: { text: '종료됨', color: 'text-gray-100 bg-purple-800' },
  };

  const formatText = {
    GENERAL: '일반',
    BOARD: '보드',
  };

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
  const modeArray = Array.isArray(mode) ? mode : [mode];
  const yearArray = Array.isArray(selectedYear) ? selectedYear : [selectedYear];

  return (
    <div className='relative h-screen w-full overflow-hidden'>
      <div className='flex h-full flex-col px-4 py-3'>
        <div className='mb-3 text-center'>
          <h1 className='drop-shadow-glow flex items-center justify-center text-4xl font-bold text-purple-100'>
            {roomTitle || '게임 대기실'}
            <span className='ml-2 text-base text-purple-200'>
              {hasPassword ? '🔒' : '🔓'}
            </span>
          </h1>
          <div className='mt-1 flex items-center justify-center gap-3'>
            <span
              className={`rounded-md px-3 py-1 text-sm font-medium ${statusConfig[status].color}`}
            >
              {statusConfig[status].text}
            </span>
            <span className='rounded-md bg-purple-800 px-3 py-1 text-sm font-medium text-purple-100'>
              {formatText[format]} 모드
            </span>
          </div>
        </div>

        <div className='mb-3'>
          <div className='mb-1 flex items-center justify-between'>
            <h3 className='text-lg font-medium text-purple-100'>참가자 목록</h3>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className='rounded-full bg-purple-800 px-3 py-1 text-sm text-purple-100 disabled:opacity-50'
              >
                ◀
              </button>
              <span className='text-sm text-purple-100'>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages}
                className='rounded-full bg-purple-800 px-3 py-1 text-sm text-purple-100 disabled:opacity-50'
              >
                ▶
              </button>
            </div>
          </div>

          <div className='rounded-lg bg-purple-900/50 p-3 shadow-inner'>
            <div className='grid grid-cols-5 grid-rows-3 gap-5'>
              {displayParticipants.map((participant, index) => (
                <div
                  key={participant ? participant.userName : `empty-${index}`}
                  className={cn(
                    'flex items-center justify-start rounded-md p-3 py-6 transition-all',
                    participant
                      ? participant.userName === hostNickname
                        ? 'border border-purple-300 bg-purple-700'
                        : 'border border-purple-700 bg-purple-800'
                      : 'border border-dashed border-purple-700 bg-purple-900/30',
                  )}
                >
                  {participant ? (
                    <>
                      <div className='relative mr-4 h-8 w-8 flex-shrink-0'>
                        <div className='flex h-full w-full items-center justify-center rounded-full bg-purple-600'>
                          <span className='text-xs font-bold text-purple-100'>
                            {participant.userName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <span className='w-full truncate text-left text-purple-100'>
                        {participant.userName}
                      </span>
                    </>
                  ) : (
                    <div className='flex w-full items-center'>
                      <div className='mr-2 flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-purple-700'>
                        <span className='text-[8px] text-purple-400'>
                          빈자리
                        </span>
                      </div>
                      <span className='text-[10px] text-purple-400'>
                        대기 중...
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 섹션 - 채팅과 방 정보를 나란히 표시 */}
        <div className='flex flex-1 flex-col gap-4 overflow-hidden md:flex-row'>
          <div className='rounded-lg bg-purple-700/40 p-2.5 shadow-md backdrop-blur-sm md:w-[40%]'>
            <h2 className='mb-1.5 border-b border-purple-400/40 pb-1 text-3xl font-bold text-purple-100'>
              <span className='mr-1'>🎮</span> 방 정보
            </h2>

            {/* 3열 레이아웃으로 변경 */}
            <div className='mb-2 grid grid-cols-2 gap-2'>
              {/* 참가 인원 */}
              <div className='rounded-md bg-purple-600/30 p-1.5 shadow-sm backdrop-blur-sm'>
                <span className='block font-medium text-purple-200'>
                  참가 인원
                </span>
                <div className='flex items-end justify-between'>
                  <span className='text-base font-bold text-purple-100'>
                    {participantInfo.length}
                  </span>
                  <span className='text-xs text-purple-200'>
                    / {maxPlayer}명
                  </span>
                </div>
              </div>

              {/* 게임 라운드 */}
              <div className='rounded-md bg-purple-600/30 p-1.5 shadow-sm backdrop-blur-sm'>
                <span className='block font-medium text-purple-200'>
                  게임 라운드
                </span>
                <div className='flex items-end justify-between'>
                  <span className='text-base font-bold text-purple-100'>
                    {maxGameRound}
                  </span>
                  <span className='text-xs text-purple-200'>회</span>
                </div>
              </div>
            </div>

            <div className='space-y-1.5'>
              {/* 게임 모드 목록 */}
              <div className='rounded-md bg-purple-600/30 p-2 shadow-sm backdrop-blur-sm'>
                <div className='mb-1 flex items-center justify-between'>
                  <span className='font-medium text-purple-200'>게임 모드</span>
                </div>
                <div className='mt-2 flex max-h-16 flex-wrap gap-1 overflow-y-auto'>
                  {modeArray.map((m, index) => (
                    <span
                      key={`mode-${index}`}
                      className='inline-block rounded-full bg-pink-400/40 px-2 py-0.5 text-sm font-medium text-white shadow-sm'
                    >
                      {MODE_DICT[m]}
                    </span>
                  ))}
                </div>
              </div>

              {/* 선택 연도 목록 */}
              <div className='rounded-md bg-purple-600/30 p-2 shadow-sm backdrop-blur-sm'>
                <div className='mb-1 flex items-center justify-between'>
                  <span className='font-medium text-purple-200'>선택 연도</span>
                  <span className='text-purple-300'>
                    {yearArray.length}개 선택
                  </span>
                </div>
                <div className='mt-2 flex max-h-16 flex-wrap gap-1 overflow-y-auto'>
                  {yearArray.map((year, index) => (
                    <span
                      key={`year-${index}`}
                      className='inline-block rounded-full bg-cyan-400/40 px-2 py-0.5 text-sm font-medium text-white shadow-sm'
                    >
                      {year}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {isHost && (
              <div className='mt-2'>
                <Button
                  onClick={handleStartGame}
                  className='w-full rounded-md bg-purple-500/60 px-3 py-1.5 text-sm font-bold text-white shadow-md transition-all hover:bg-purple-400/70 hover:shadow-lg'
                >
                  게임 시작
                </Button>
              </div>
            )}
          </div>

          {/* 채팅 박스 */}
          <div className='flex-1 md:w-[60%]'>
            <div className='h-full rounded-lg border border-purple-700 bg-purple-900/50 shadow-md'>
              <ScoreChatBox
                currentUserId={currentUserId}
                roomId={roomId}
                channelId={channelId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreWaitingPanel;
