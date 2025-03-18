import { Button } from '../ui/button';

interface ReadyPanelProps {
  currentUserId: string;
  handleStartGame: () => void;
  roomId: string;
}

const TReadyPannel = ({
  currentUserId,
  handleStartGame,
  roomId,
}: ReadyPanelProps) => {
  return (
    <div className='flex h-screen w-full flex-col justify-between p-8'>
      <div className='grid h-2/3 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        <div className='flex h-[320px] w-full flex-col items-center justify-between overflow-hidden rounded-2xl border-3 border-cyan-400 bg-black/80 p-4 shadow-lg shadow-cyan-400/50'>
          {/* 캐릭터 표시 영역 */}
          <div className='flex w-full flex-1 items-center justify-center opacity-100'>
            <div className='flex h-35 w-30 items-center justify-center'>
              <object
                data='/yellow.svg'
                type='image/svg+xml'
                className='h-full w-full'
              ></object>
            </div>
          </div>

          {/* 닉네임 영역 */}
          <div className='mt-2 w-full rounded-lg bg-cyan-900 px-2 py-2 text-center text-sm font-bold tracking-wider text-cyan-300'>
            플레이어1
          </div>
        </div>
        <div className='h-[320px] w-full rounded-2xl bg-black opacity-50'></div>
        <div className='h-[320px] w-full rounded-2xl bg-black opacity-50'></div>
        <div className='h-[320px] w-full rounded-2xl bg-black opacity-50'></div>
        <div className='h-[320px] w-full rounded-2xl bg-black opacity-50'></div>
        <div className='h-[320px] w-full rounded-2xl bg-black opacity-50'></div>
        <div className='h-[320px] w-full rounded-2xl bg-black opacity-50'></div>
        <div className='h-[320px] w-full rounded-2xl bg-black opacity-50'></div>
      </div>
      <div className='flex gap-4 self-end'>
        <Button
          variant='custom'
          className='rounded-3xl bg-gray-500 px-10 py-[25px] text-xl'
        >
          준비하기
        </Button>
        <Button
          variant='custom'
          className='rounded-3xl bg-purple-400 px-10 py-[25px] text-xl'
        >
          게임 시작
        </Button>
      </div>
    </div>
  );
};

export default TReadyPannel;
