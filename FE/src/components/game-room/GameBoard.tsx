import { useGameScreenStore } from '@/stores/websocket/useGameScreenStore';

export default function GameBoard() {
  const { remainTime, songUrl } = useGameScreenStore();

  return (
    <div className='h-full flex flex-col p-4'>
      {remainTime ? <>타이머: {remainTime}</> : <>노래: {songUrl}</>}
    </div>
  );
}
