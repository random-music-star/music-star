import { useRouter } from 'next/router';

import { Button } from '../ui/button';

const GameExitButton = () => {
  const router = useRouter();

  const handleExit = () => {
    router.push('/game/lobby/1');
  };
  return (
    <div className='absolute right-0 bottom-0 p-6 text-end'>
      <Button
        variant='custom'
        className='border border-white px-4 py-[20px] text-2xl font-semibold backdrop-blur hover:shadow-lg hover:shadow-purple-400/90'
        onClick={handleExit}
      >
        EXIT
      </Button>
    </div>
  );
};

export default GameExitButton;
