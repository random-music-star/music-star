import { useGameRoundResultStore } from '@/stores/websocket/useGameRoundResultStore';

const GameResult = () => {
  const { gameRoundResult } = useGameRoundResultStore();

  // result 가 없을 때 에러처리 필요함
  if (!gameRoundResult) return;

  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <p>{gameRoundResult.winner}</p>
      <p>{gameRoundResult.songTitle}</p>
      <p>{gameRoundResult.singer}</p>
    </div>
  );
};

export default GameResult;
