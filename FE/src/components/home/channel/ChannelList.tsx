import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

const pianoKeys = [
  { key: 'w', channelIndex: null },
  { key: 'b', channelIndex: null },
  { key: 'w', channelIndex: null },
  { key: 'b', channelIndex: null },
  { key: 'w', channelIndex: 0 },
  { key: 'w', channelIndex: 1 },
  { key: 'b', channelIndex: null },
  { key: 'w', channelIndex: 2 },
  { key: 'b', channelIndex: null },
  { key: 'w', channelIndex: 3 },
  { key: 'b', channelIndex: null },
  { key: 'w', channelIndex: 4 },
  { key: 'w', channelIndex: 5 },
  { key: 'b', channelIndex: null },
  { key: 'w', channelIndex: null },
  { key: 'b', channelIndex: null },
  { key: 'w', channelIndex: null },
];

const channelCongestion = (playerCount: number, maxPlayers: number) => {
  const ratio = playerCount / maxPlayers;

  let color, congestion;
  if (ratio < 0.3) {
    color = 'from-green-400 to-green-600';
    congestion = '여유';
  } else if (ratio < 0.7) {
    color = 'from-yellow-400 to-orange-500';
    congestion = '보통';
  } else {
    color = 'from-red-400 to-red-600';
    congestion = '혼잡';
  }

  return { color, congestion };
};

const ChannelList = () => {
  const router = useRouter();
  const { nickname } = useNicknameStore();

  // 더미데이터
  const channels = [
    {
      channelId: 0,
      name: '채널1',
      playerCount: 120,
      maxPlayers: 500,
    },
    {
      channelId: 1,
      name: '채널2',
      playerCount: 300,
      maxPlayers: 500,
    },
    {
      channelId: 2,
      name: '채널3',
      playerCount: 450,
      maxPlayers: 500,
    },
    {
      channelId: 3,
      name: '채널4',
      playerCount: 50,
      maxPlayers: 500,
    },
    {
      channelId: 4,
      name: '채널5',
      playerCount: 200,
      maxPlayers: 500,
    },
    {
      channelId: 5,
      name: '채널6',
      playerCount: 370,
      maxPlayers: 500,
    },
  ];

  const handleEnterChannel = (index: number) => {
    if (!nickname) {
      toast('로그인 후 입장 가능합니다!', { id: 'login-required' });
      return;
    }
    router.push(`/game/lobby/${index + 1}`);
  };

  return (
    <div className='relative flex w-full'>
      {/* 흰 건반 */}
      {pianoKeys.map((p, index) => {
        if (p.key !== 'w') return null;

        const isActive = p.channelIndex !== null;

        return (
          <motion.div
            key={`white-${index}`}
            className={cn(
              'relative flex h-70 w-[10%] cursor-pointer flex-col items-center justify-end rounded-lg border border-gray-300 bg-white transition-transform',
              isActive ? 'hover:bg-gray-100' : 'opacity-50',
            )}
            whileHover={isActive ? { scale: 1.05 } : {}}
            whileTap={isActive ? { scale: 0.95 } : {}}
            onClick={
              isActive ? () => handleEnterChannel(p.channelIndex) : undefined
            }
          >
            {isActive && (
              <>
                <div className='mb-4 flex flex-col items-center justify-center font-bold text-gray-700'>
                  <span className='text-lg'>채널</span>
                  <span className='min-w-4 rounded-3xl bg-purple-500 p-[5px] text-center text-lg text-white lg:min-w-16'>
                    {channels[p.channelIndex].channelId + 1}
                  </span>
                </div>

                <div className='absolute flex w-full translate-y-14 flex-col items-center justify-center'>
                  <div className='h-[15px] w-[90%] overflow-hidden rounded-2xl bg-purple-800/20'>
                    <div
                      className={cn(
                        channelCongestion(
                          channels[p.channelIndex].playerCount,
                          channels[p.channelIndex].maxPlayers,
                        ).color,

                        'h-full w-full rounded-l-2xl bg-gradient-to-r',
                      )}
                      style={{
                        width: `${(channels[p.channelIndex].playerCount / channels[p.channelIndex].maxPlayers) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span>
                    {
                      channelCongestion(
                        channels[p.channelIndex].playerCount,
                        channels[p.channelIndex].maxPlayers,
                      ).congestion
                    }
                  </span>
                </div>
              </>
            )}
          </motion.div>
        );
      })}

      {/* 검은 건반 */}
      {pianoKeys.map((p, index) => {
        if (p.key !== 'b') return null;

        const whiteBefore = pianoKeys
          .slice(0, index)
          .filter(k => k.key === 'w').length;
        const leftOffsetPercent = whiteBefore * 10 - 3;

        return (
          <div
            key={`black-${index}`}
            className={cn(
              'absolute z-10 h-1/2 w-[6%] rounded-b-lg bg-gray-900 transition-transform',
            )}
            style={{
              left: `${leftOffsetPercent}%`,
            }}
          ></div>
        );
      })}
    </div>
  );
};

export default ChannelList;
