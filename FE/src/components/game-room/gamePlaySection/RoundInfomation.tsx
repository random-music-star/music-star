import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

import GameMusicPlayer from './GameMusicPlayer';
import GameResultContent from './GameResultContent';
import RoundRolling from './RoundRolling';
import YoutubePlayer from './YoutubePlayer';

const RoundInformation = () => {
  const { gameState } = useGameStateStore();

  return (
    <div className='game-play-panel flex max-h-[140px] min-h-[140px] min-w-[500px] flex-col items-center justify-center rounded-2xl bg-black/80 p-4'>
      <YoutubePlayer />

      {(gameState === 'ROUND_INFO' || gameState === 'ROUND_OPEN') && (
        <RoundRolling />
      )}
      {gameState === 'GAME_END' && <GameResultContent />}

      {(gameState === 'ROUND_START' || gameState === 'GAME_RESULT') && (
        <GameMusicPlayer gameState={gameState} />
      )}
    </div>
  );
};

export default RoundInformation;

/**
 *
 * IN_PROGRESS 상태임
 *
 * 라운드 정보는 계속 최상단에 보여져야 함
 * 1. TIMER_WAIT일 때 RoundRolling 컴포넌트
 * 2. ROUND_OPEN일 때 RoundOPEN 컴포넌트
 * 3. ( QUIZ_OPEN / GAME_RESULT ) MusicPlayer 컴포넌트
 *  3-1. QUIZ_OPEN 일 때 힌트 나오는 컴포넌트 필요함
 *  3-2. GAME_RESULT 일 때 정답자 누군지 나오는 컴포넌트 필요함
 * 4. SCORE_UPDATE일 때 컴포넌트 // winner 랑 몇칸 이동할건지
 */
