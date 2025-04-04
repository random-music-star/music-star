import { useRouter } from 'next/router';

import { useChannelStore } from '@/stores/lobby/useChannelStore';

import { Button } from '../ui/button';

const GameExitButton = () => {
  const router = useRouter();
  const { currentChannelId } = useChannelStore();

  const handleExit = () => {
    router.push(`/game/lobby/${currentChannelId}`);
  };

  return (
    <div className='absolute top-4 right-4 z-10'>
      <Button
        variant='custom'
        className='group relative overflow-hidden rounded-full bg-red-600/80 px-5 py-2 text-base font-bold tracking-wider text-white uppercase transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30'
        onClick={handleExit}
      >
        <span className='relative z-10 flex items-center gap-1.5'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='transition-transform duration-300 group-hover:-translate-x-1'
          >
            <path d='M18 6L6 18'></path>
            <path d='M6 6l12 12'></path>
          </svg>
          EXIT
        </span>
      </Button>
    </div>
  );
};

export default GameExitButton;
