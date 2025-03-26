import React from 'react';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useGameRoundResultStore } from '@/stores/websocket/useGameRoundResultStore';
import { useGameScreenStore } from '@/stores/websocket/useGameScreenStore';

interface MusicPlayerProps {
  gameState: 'GAME_RESULT' | 'QUIZ_OPEN';
}

const GameMusicPlayer = ({ gameState }: MusicPlayerProps) => {
  const { songUrl, gameHint } = useGameScreenStore();
  const { roundInfo } = useGameRoundInfoStore();
  const { gameRoundResult } = useGameRoundResultStore();

  if (!roundInfo) return null;
  if (!songUrl) return <div></div>;

  const { round: currentRound } = roundInfo;

  return (
    <div className='w-full max-w-full'>
      {/* 분리된 플레이어 컴포넌트 */}

      {/* 헤더 */}
      <div className='mb-2 flex items-center justify-between text-center'>
        <h2 className='text-xl font-bold text-fuchsia-300'>
          라운드 {currentRound}
        </h2>
        <div className='flex flex-col items-center text-sm text-purple-200'>
          {gameState === 'GAME_RESULT' ? (
            <span className='text-fuchsia-300'>
              다음 문제를 풀고싶다면 . 을 눌러주세요!
            </span>
          ) : (
            <span className='text-fuchsia-300'>
              채팅창에 정답을 입력하세요! (스킵: .)
            </span>
          )}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      {gameState === 'QUIZ_OPEN' && (
        <div className='flex w-full flex-col text-purple-100'>
          {/* 힌트 정보 */}
          <div className='w-full space-y-4 text-base'>
            <div className='flex justify-between gap-12'>
              <span className='min-w-[40px] font-medium text-purple-200'>
                가수
              </span>
              <span className='font-bold text-fuchsia-200'>
                {!gameHint
                  ? '잠시 후 공개'
                  : gameHint.singer
                    ? gameHint.singer
                    : '잠시 후 공개'}
              </span>
            </div>

            <div className='flex justify-between gap-12'>
              <span className='min-w-[40px] font-medium text-purple-200'>
                제목
              </span>
              <span className='font-bold text-fuchsia-200'>
                {!gameHint
                  ? '잠시 후 공개'
                  : gameHint.title
                    ? gameHint.title
                    : '잠시 후 공개'}
              </span>
            </div>
          </div>

          {/* 안내 텍스트 */}
        </div>
      )}

      {gameState === 'GAME_RESULT' && gameRoundResult && (
        <div className='flex w-full items-center justify-evenly'>
          {gameRoundResult.winner && (
            <div className='mr-4 flex flex-col items-center justify-center gap-2'>
              <span className='text-sm font-medium text-white'>
                {gameRoundResult.winner}
              </span>
              <h3 className='text-3xl font-bold tracking-wide text-cyan-400'>
                정 답 !
              </h3>
            </div>
          )}
          <div>
            <div className='space-y-4 text-base text-purple-100'>
              <div className='flex w-full flex-col gap-2'>
                <div className='flex w-full items-start gap-4'>
                  <span className='w-[40px] flex-shrink-0 font-medium text-purple-200'>
                    가수
                  </span>
                  <span className='flex-1 font-bold break-words text-cyan-100'>
                    {gameRoundResult.singer || '정보 없음'}
                  </span>
                </div>

                <div className='flex w-full items-start gap-4'>
                  <span className='w-[40px] flex-shrink-0 font-medium text-purple-200'>
                    제목
                  </span>
                  <span className='flex-1 font-bold break-words text-cyan-100'>
                    {gameRoundResult.songTitle || '정보 없음'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMusicPlayer;
