import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import RoundInformation from '../gamePlaySection/RoundInfomation';
import { currentUser, dummyParticipants, dummyScores } from './dummyData';

// framer-motion과 Next.js Image를 결합한 MotionImage
const MotionImage = motion(Image);

interface Participant {
  name: string;
  score: number;
  imageSrc: string;
  isCurrentUser: boolean;
}

const PlazaScoreboard = () => {
  // 실제 데이터 사용 (현재는 주석 처리)
  // const { scores } = useScoreStore();
  // const { participantInfo } = useParticipantInfoStore();

  const [isLoading, setIsLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState<Participant[]>([]);

  // 테스트를 위한 순위 변경 함수
  const shuffleRanks = () => {
    setAllPlayers(prev => {
      const newPlayers = [...prev];
      // 임의로 일부 플레이어의 점수 변경
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * newPlayers.length);
        const change = Math.floor(Math.random() * 1000) - 500; // -500에서 500 사이의 변화
        newPlayers[randomIndex] = {
          ...newPlayers[randomIndex],
          score: Math.max(0, newPlayers[randomIndex].score + change),
        };
      }
      return newPlayers;
    });
  };

  // 현재 사용자 정보
  const [myRank, setMyRank] = useState<{
    rank: number;
    participant: Participant | null;
  }>({
    rank: 0,
    participant: null,
  });

  // 참가자 정보와 점수를 병합
  useEffect(() => {
    // 테스트를 위해 더미 데이터만 사용
    const merged = dummyParticipants.map(p => ({
      name: p.userName,
      score: dummyScores[p.userName] || 0,
      imageSrc: p.character,
      // 현재 사용자인지 확인 (더미 데이터에서는 currentUser 변수로 식별)
      isCurrentUser: p.userName === currentUser,
    }));

    // 실제 구현 시 아래 주석 해제
    /*
    // 데이터가 없는 경우 더미 데이터로 대체
    const useDummy = participantInfo.length === 0;
    
    let merged: Participant[];
    
    if (useDummy) {
      // 더미 데이터 사용
      merged = dummyParticipants.map(p => ({
        name: p.userName,
        score: dummyScores[p.userName] || 0,
        imageSrc: p.character,
        isCurrentUser: p.userName === currentUser,
      }));
    } else {
      // 실제 데이터 사용
      merged = participantInfo.map(p => ({
        name: p.userName,
        score: scores[p.userName] ?? 0,
        imageSrc: p.character,
        // TODO: 현재 사용자인지 확인 (실제 구현에서는 store에서 조회)
        // 주석: 당신의 이름을 조회하는 곳
        isCurrentUser: false, // store에서 현재 사용자 정보 조회하여 설정
      }));
    }
    */

    setAllPlayers(merged);
    setIsLoading(false);

    // 테스트용: 5초마다 랭킹 변경 시뮬레이션
    const interval = setInterval(() => {
      shuffleRanks();
    }, 5000);

    return () => clearInterval(interval);
    // }, [participantInfo, scores]);
  }, []);

  // 점수 내림차순 정렬
  const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);
  const topThree = sortedPlayers.slice(0, 3); // 1~3등
  const nextTwelve = sortedPlayers.slice(3, 15); // 4~15등

  // 현재 사용자의 순위 찾기
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
        <div className='text-xl text-white'>
          게임 참가자 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className='relative h-screen w-full overflow-hidden'>
      {/* 라운드 정보 */}
      <div className='absolute top-20 left-1/2 z-10 -translate-x-1/2 transform'>
        <RoundInformation />
      </div>

      {/* 좌측 상단 랭킹 테이블 (1~10위) */}
      <div className='absolute top-6 left-6 z-10 overflow-hidden rounded-lg bg-purple-900/60 backdrop-blur-md'>
        <div className='w-80 overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-purple-900/60'>
              <tr>
                <th className='px-3 py-2 text-center text-xs text-purple-200'>
                  순위
                </th>
                <th className='px-3 py-2 text-left text-xs text-purple-200'>
                  플레이어
                </th>
                <th className='px-3 py-2 text-right text-xs text-purple-200'>
                  점수
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-purple-800/50'>
              {sortedPlayers.slice(0, 10).map((player, index) => (
                <motion.tr
                  key={player.name}
                  className={`transition-colors duration-200 hover:bg-purple-600/30 ${
                    player.isCurrentUser ? 'bg-purple-700/50' : ''
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
                  <td className='px-3 py-1 text-center text-xs'>
                    <span
                      className={`font-bold ${
                        index === 0
                          ? 'text-yellow-400'
                          : index === 1
                            ? 'text-gray-300'
                            : index === 2
                              ? 'text-amber-600'
                              : 'text-white'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className='px-3 py-1 text-left text-xs text-white'>
                    <div className='flex items-center space-x-1'>
                      <Image
                        src={player.imageSrc}
                        alt=''
                        width={20}
                        height={20}
                        className='h-5 w-5'
                      />
                      <span
                        className={`max-w-24 truncate ${
                          player.isCurrentUser
                            ? 'font-bold text-orange-400'
                            : ''
                        }`}
                      >
                        {player.name}
                      </span>
                    </div>
                  </td>
                  <motion.td
                    className='px-3 py-1 text-right text-xs font-medium text-orange-400'
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                    key={player.score} // 점수가 변경될 때 애니메이션 트리거
                  >
                    {player.score.toLocaleString()}
                  </motion.td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* 내 랭킹 정보 (10위 밖이면 여기에 표시) */}
          {myRank.rank > 10 && myRank.participant && (
            <div className='border-t border-purple-700/30 bg-purple-800/70 p-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <span className='text-xs font-bold text-white'>
                    {myRank.rank}위
                  </span>
                  <div className='flex items-center space-x-1'>
                    <Image
                      src={myRank.participant.imageSrc}
                      alt=''
                      width={20}
                      height={20}
                      className='h-5 w-5'
                    />
                    <span className='max-w-24 truncate text-xs font-bold text-orange-400'>
                      {myRank.participant.name}
                    </span>
                  </div>
                </div>
                <span className='text-xs font-bold text-orange-400'>
                  {myRank.participant.score.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상단 중앙 포디엄: 1, 2, 3위 플레이어 */}
      <div className='absolute top-[45%] left-1/2 flex -translate-x-1/2 transform items-end justify-center gap-10'>
        <AnimatePresence mode='popLayout'>
          {/* 2위 */}
          {topThree[1] && (
            <motion.div
              key={`podium-${topThree[1].name}`}
              className='flex flex-col items-center'
              layout
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <MotionImage
                src={topThree[1].imageSrc}
                alt={topThree[1].name}
                width={96}
                height={96}
                className='object-contain drop-shadow-lg filter'
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />

              <motion.div className='mt-1 text-xl font-bold text-gray-300'>
                2위
              </motion.div>
              <motion.div className='text-sm text-white'>
                {topThree[1].name.length > 8
                  ? topThree[1].name.slice(0, 8) + '...'
                  : topThree[1].name}
              </motion.div>
            </motion.div>
          )}

          {/* 1위 */}
          {topThree[0] && (
            <motion.div
              key={`podium-${topThree[0].name}`}
              className='relative flex flex-col items-center'
              layout
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <motion.div
                className="absolute -top-12 h-12 w-12 bg-[url('/crown.png')] bg-contain bg-center bg-no-repeat drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] filter"
                animate={{
                  rotateZ: [0, 5, 0, -5, 0],
                  y: [0, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut',
                }}
              />
              <MotionImage
                src={topThree[0].imageSrc}
                alt={topThree[0].name}
                width={128}
                height={128}
                className='object-contain drop-shadow-lg filter'
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />

              <motion.div className='mt-1 text-xl font-bold text-yellow-400'>
                1위
              </motion.div>
              <motion.div className='text-sm text-white'>
                {topThree[0].name.length > 8
                  ? topThree[0].name.slice(0, 8) + '...'
                  : topThree[0].name}
              </motion.div>
            </motion.div>
          )}

          {/* 3위 */}
          {topThree[2] && (
            <motion.div
              key={`podium-${topThree[2].name}`}
              className='flex flex-col items-center'
              layout
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <MotionImage
                src={topThree[2].imageSrc}
                alt={topThree[2].name}
                width={96}
                height={96}
                className='object-contain drop-shadow-lg filter'
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />

              <motion.div className='mt-1 text-xl font-bold text-amber-600'>
                3위
              </motion.div>
              <motion.div className='text-sm text-white'>
                {topThree[2].name.length > 8
                  ? topThree[2].name.slice(0, 8) + '...'
                  : topThree[2].name}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단: 캐릭터 리스트 (4~15위)와 좌우에 4위, 15위 뱃지 */}
      <div className='absolute bottom-20 left-0 flex w-full items-end justify-between px-4'>
        {/* 4위 뱃지 - 좌측 */}
        <div className='flex-shrink-0'>
          <div className='rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white shadow-lg'>
            4위
          </div>
        </div>

        {/* 캐릭터 리스트 */}
        <div className='flex items-end justify-center gap-6'>
          <AnimatePresence>
            {nextTwelve.map((player, idx) => {
              const imageSize = 45; // 모두 동일한 크기 적용
              // 인덱스에 따라 서로 다른 속도로 애니메이션 진행 (예: 0: 2초, 1: 2.5초, 2: 3초)
              const duration = idx % 3 === 0 ? 2 : idx % 3 === 1 ? 2.5 : 3;
              return (
                // 부모: layout 애니메이션 담당 (자리 이동 시 부드럽게)
                <motion.div
                  key={player.name}
                  className='relative flex flex-col items-center'
                  layout
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                >
                  <motion.div
                    className='flex flex-col items-center'
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: duration,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* 닉네임 뱃지 */}
                    <div className='mb-1'>
                      <span className='inline-block truncate rounded-full bg-gradient-to-b from-blue-500/90 to-blue-700/90 px-2 py-1 text-xs font-medium text-white shadow-lg'>
                        {player.name.length > 7
                          ? player.name.slice(0, 7) + '...'
                          : player.name}
                      </span>
                    </div>

                    {/* 캐릭터 이미지 */}
                    <MotionImage
                      src={player.imageSrc}
                      alt={player.name}
                      width={imageSize}
                      height={imageSize}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 15위 뱃지 - 우측 */}
        <div className='flex-shrink-0'>
          <div className='rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-lg'>
            15위
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlazaScoreboard;
