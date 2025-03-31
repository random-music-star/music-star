import { useGameRoundResultStore } from '@/stores/websocket/useGameRoundResultStore';

const RoundResultContent = () => {
  const { gameRoundResult } = useGameRoundResultStore();

  return (
    gameRoundResult && (
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
    )
  );
};
export default RoundResultContent;
