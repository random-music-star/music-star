import { useGameScreenStore } from '@/stores/websocket/useGameScreenStore';

const GameResult = () => {
  const { gameResult } = useGameScreenStore();

  if (!gameResult) return;

  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <p>{gameResult.winner}</p>
      <p>{gameResult.songTitle}</p>
      <p>{gameResult.singer}</p>
    </div>
  );
};

export default GameResult;
