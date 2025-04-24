import { useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useScoreStore } from '@/stores/websocket/useScoreStore';

interface Participant {
  name: string;
  score: number;
  imageSrc: string;
  isCurrentUser: boolean;
  id: string;
}

const ScoreboardTable = () => {
  // 실제 데이터 사용
  const { scores } = useScoreStore();
  const { participantInfo } = useParticipantInfoStore();
  const { nickname: currentUser } = useNicknameStore();

  const [isLoading, setIsLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState<Participant[]>([]);

  useEffect(() => {
    if (participantInfo.length > 0) {
      const merged = participantInfo.map(p => ({
        name: p.userName,
        score: scores[p.userName] ?? 0,
        imageSrc: p.character,
        isCurrentUser: p.userName === currentUser,
        id: p.userName,
      }));
      setAllPlayers(merged);
      setIsLoading(false);
    }
  }, [participantInfo, scores, currentUser]);

  // 상위 10명의 플레이어 선택
  const sortedPlayers = useMemo(
    () => [...allPlayers].sort((a, b) => b.score - a.score).slice(0, 10),
    [allPlayers],
  );

  // 내 랭킹 계산
  const myRank = useMemo(() => {
    const allSorted = [...allPlayers].sort((a, b) => b.score - a.score);
    const myIndex = allSorted.findIndex(p => p.isCurrentUser);
    return {
      rank: myIndex + 1,
      participant: myIndex !== -1 ? allSorted[myIndex] : null,
    };
  }, [allPlayers]);

  // 랭킹별 스타일 함수
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 0: // 1등
        return {
          numberSize: 'text-xl',
          nameSize: 'text-lg',
          scoreSize: 'text-lg',
          medalColor: 'text-yellow-300',
          avatarSize: 'h-9 w-9',
        };
      case 1: // 2등
        return {
          numberSize: 'text-lg',
          nameSize: 'text-base',
          scoreSize: 'text-base',
          medalColor: 'text-gray-300',
          avatarSize: 'h-8 w-8',
        };
      case 2: // 3등
        return {
          numberSize: 'text-base',
          nameSize: 'text-base',
          scoreSize: 'text-base',
          medalColor: 'text-amber-600',
          avatarSize: 'h-7 w-7',
        };
      default: // 4등 이하
        return {
          numberSize: 'text-sm',
          nameSize: 'text-sm',
          scoreSize: 'text-sm',
          medalColor: 'text-purple-200',
          avatarSize: 'h-6 w-6',
        };
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='text-base text-cyan-300'>정보 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className='z-50 w-full overflow-hidden rounded-lg bg-purple-900/40 p-4 backdrop-blur-sm'>
      <table className='w-full'>
        <thead className='border-b border-purple-600/30'>
          <tr>
            <th className='px-3 py-2 text-center text-sm font-bold text-cyan-200'>
              순위
            </th>
            <th className='px-3 py-2 text-left text-sm font-bold text-cyan-200'>
              플레이어
            </th>
            <th className='px-3 py-2 text-right text-sm font-bold text-cyan-200'>
              점수
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-purple-700/30'>
          <AnimatePresence initial={false} mode='popLayout'>
            {sortedPlayers.map((player, index) => {
              const style = getRankStyle(index);
              return (
                <motion.tr
                  key={player.id}
                  className={`transition-colors duration-200 ${
                    player.isCurrentUser
                      ? 'bg-purple-700/60'
                      : 'hover:bg-purple-800/40'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                  layout
                >
                  <td className='px-3 py-2 text-center'>
                    <span
                      className={`font-black ${style.numberSize} ${style.medalColor}`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className='px-3 py-2 text-left'>
                    <div className='flex items-center space-x-6'>
                      <div className={style.avatarSize}>
                        <Image
                          src={player.imageSrc}
                          alt=''
                          width={36}
                          height={36}
                        />
                      </div>
                      <span
                        className={`truncate ${style.nameSize} font-bold ${
                          index < 3 ? 'text-white' : 'text-purple-100'
                        }`}
                      >
                        {player.name}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`px-3 py-2 text-right ${style.scoreSize} font-bold ${
                      index < 3 ? 'text-white' : 'text-purple-200'
                    }`}
                  >
                    {player.score.toLocaleString()}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>

      {/* 내 랭킹이 10위 밖일 경우 표시 */}
      {myRank.rank > 10 && myRank.participant && (
        <div className='mt-2 border-t border-purple-600/30 bg-purple-800/60 p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <span className='text-sm font-bold text-purple-200'>
                {myRank.rank}위
              </span>
              <div className='flex items-center space-x-2'>
                <Image
                  src={myRank.participant.imageSrc}
                  alt=''
                  width={24}
                  height={24}
                  className='h-6 w-6 rounded-full'
                />
                <span className='truncate text-sm font-bold text-white'>
                  {myRank.participant.name}
                </span>
              </div>
            </div>
            <span className='text-sm font-bold text-white'>
              {myRank.participant.score.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreboardTable;
