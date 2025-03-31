import { useRoundHintStore } from '@/stores/websocket/useRoundHintStore';

const RoundPlayContent = () => {
  const { roundHint } = useRoundHintStore();

  return (
    <div className='flex w-full flex-col text-purple-100'>
      <div className='w-full space-y-4 text-base'>
        <div className='flex justify-between gap-12'>
          <span className='min-w-[40px] font-medium text-purple-200'>가수</span>
          <span className='font-bold text-fuchsia-200'>
            {!roundHint
              ? '잠시 후 공개'
              : roundHint.singer
                ? roundHint.singer
                : '잠시 후 공개'}
          </span>
        </div>

        <div className='flex justify-between gap-12'>
          <span className='min-w-[40px] font-medium text-purple-200'>제목</span>
          <span className='font-bold text-fuchsia-200'>
            {!roundHint
              ? '잠시 후 공개'
              : roundHint.title
                ? roundHint.title
                : '잠시 후 공개'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoundPlayContent;
