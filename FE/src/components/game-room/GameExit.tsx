import { useRouter } from 'next/router';

import { Button } from '../ui/button';

const GameExit = () => {
  const router = useRouter();

  const handleExit = () => {
    router.push('/game/lobby');
  };
  return (
    <Button
      variant='custom'
      className='border border-white px-4 py-[20px] text-2xl font-semibold backdrop-blur hover:shadow-lg hover:shadow-purple-400/90'
      onClick={handleExit}
    >
      EXIT
    </Button>
  );
};

export default GameExit;
