import { useEffect, useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useScoreStore } from '@/stores/websocket/useScoreStore';

interface Participant {
  name: string;
  score: number;
  imageSrc: string;
  isCurrentUser: boolean;
}

const ScoreboardTable = () => {
  const { scores } = useScoreStore();
  const { participantInfo } = useParticipantInfoStore();
  const { nickname: currentUser } = useNicknameStore();

  const [isLoading, setIsLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState<Participant[]>([]);
  const [myRank, setMyRank] = useState<{
    rank: number;
    participant: Participant | null;
  }>({
    rank: 0,
    participant: null,
  });

  useEffect(() => {
    if (participantInfo.length > 0) {
      const merged = participantInfo.map(p => ({
        name: p.userName,
        score: scores[p.userName] ?? 0,
        imageSrc: p.character,
        isCurrentUser: p.userName === currentUser,
      }));
      setAllPlayers(merged);
      setIsLoading(false);
    }
  }, [participantInfo, scores, currentUser]);

  const sortedPlayers = useMemo(
    () => [...allPlayers].sort((a, b) => b.score - a.score),
    [allPlayers],
  );

  useEffect(() => {
    const currentUserIndex = sortedPlayers.findIndex(
      player => player.isCurrentUser,
    );
    if (currentUserIndex !== -1) {
      setMyRank({
        rank: currentUserIndex + 1,
        participant: sortedPlayers[currentUserIndex],
      });
    }
  }, [sortedPlayers]);

  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='text-base text-purple-700'>정보 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className='z-50 w-full overflow-hidden rounded-lg border border-purple-200 bg-purple-50 p-3'>
      <table className='w-full'>
        <thead className='bg-purple-100'>
          <tr>
            <th className='px-2 py-1 text-center text-xs text-purple-800'>
              순위
            </th>
            <th className='px-2 py-1 text-left text-xs text-purple-800'>
              플레이어
            </th>
            <th className='px-2 py-1 text-right text-xs text-purple-800'>
              점수
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-purple-200'>
          {sortedPlayers.slice(0, 10).map((player, index) => (
            <motion.tr
              key={player.name}
              className={`transition-colors duration-200 hover:bg-purple-100 ${
                player.isCurrentUser ? 'bg-purple-200' : ''
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: index * 0.05,
              }}
              layout
            >
              <td className='px-2 py-1 text-center text-xs'>
                <span
                  className={`font-bold ${index === 0 ? 'text-purple-800' : 'text-purple-700'}`}
                >
                  {index + 1}
                </span>
              </td>
              <td className='px-2 py-1 text-left text-xs'>
                <div className='flex items-center space-x-1'>
                  <Image
                    src={player.imageSrc}
                    alt=''
                    width={20}
                    height={20}
                    className='h-5 w-5 rounded-full'
                  />
                  <span
                    className={`truncate ${player.isCurrentUser ? 'font-bold text-purple-900' : 'text-purple-800'}`}
                  >
                    {player.name}
                  </span>
                </div>
              </td>
              <td className='px-2 py-1 text-right text-xs font-medium text-purple-700'>
                {player.score.toLocaleString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      {myRank.rank > 10 && myRank.participant && (
        <div className='border-t border-purple-200 bg-purple-100 p-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <span className='text-xs font-bold text-purple-800'>
                {myRank.rank}위
              </span>
              <div className='flex items-center space-x-1'>
                <Image
                  src={myRank.participant.imageSrc}
                  alt=''
                  width={20}
                  height={20}
                  className='h-5 w-5 rounded-full'
                />
                <span className='truncate text-xs font-bold text-purple-900'>
                  {myRank.participant.name}
                </span>
              </div>
            </div>
            <span className='text-xs font-bold text-purple-700'>
              {myRank.participant.score.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreboardTable;
