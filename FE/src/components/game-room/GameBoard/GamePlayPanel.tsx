import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

import GameEnd from '../gameEnd';
import RoundRolling from '../round/RoundRolling';
import GameMusicPlayer from './GameMusicPlayer';

const GamePlayPanel = () => {
  const { gameState } = useGameStateStore();

  return (
    <div className='game-play-panel'>
      {gameState === 'TIMER_WAIT' && <RoundRolling />}
      {gameState === 'ROUND_OPEN' && <RoundRolling />}
      {gameState === 'GAME_END' && <GameEnd />}

      {(gameState === 'QUIZ_OPEN' || gameState === 'GAME_RESULT') && (
        <GameMusicPlayer gameState={gameState} />
      )}

      {/* {gameState === 'SCORE_UPDATE' && <TRoundResult />} */}
    </div>
  );
};

export default GamePlayPanel;

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
