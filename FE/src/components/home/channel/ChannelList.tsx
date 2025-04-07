import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { Channel, getChannelsApi } from '@/api/channels/channels';
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

const SSE_EVENTS = {
  CONNECT: 'CONNECT',
  CHANNEL_UPDATE: 'CHANNEL_UPDATE',
} as const;

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
  const [isSSEConnected, setIsSSEConnected] = useState(false);
  const [channelData, setChannelData] = useState<Channel[]>([]);

  useEffect(() => {
    (async () => {
      const { channels } = await getChannelsApi();
      setChannelData(channels);
    })();
  }, []);

  // SSE 로직
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(`${process.env.NEXT_PUBLIC_SSE_URL}/disconnect`);
    };

    window.addEventListener('beforeunload', handleUnload);

    let retryCount = 0;

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_SSE_URL}/channels`,
    );

    eventSource.addEventListener(SSE_EVENTS.CONNECT, async () => {
      setIsSSEConnected(true);

      const { channels } = await getChannelsApi();
      setChannelData(channels);
    });

    eventSource.addEventListener(SSE_EVENTS.CHANNEL_UPDATE, event => {
      const newChannel = JSON.parse(event.data);
      setChannelData(prev =>
        prev.map((channel, index) =>
          index === newChannel.channelId - 1 ? newChannel : channel,
        ),
      );
    });

    eventSource.onerror = () => {
      retryCount++;

      if (retryCount >= 3) {
        eventSource.close();
        setIsSSEConnected(false);
      }
    };

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      eventSource.close();
      setIsSSEConnected(false);
    };
  }, []);

  const handleEnterChannel = (index: number) => {
    if (!nickname) {
      toast('로그인 후 입장 가능합니다!', { id: 'login-required' });
      return;
    }
    router.push(`/game/lobby/${index + 1}`);
  };

  if (!isSSEConnected || !channelData.length) return <>서버와 연결중...</>;

  return (
    <div className='relative mx-auto flex w-full max-w-5xl'>
      {pianoKeys.map((p, index) => {
        if (p.key !== 'w') return null;

        const isActive = p.channelIndex !== null;

        return (
          <motion.div
            key={`white-${index}`}
            className={cn(
              'relative flex h-64 w-[10%] flex-col items-center justify-end rounded-lg border border-gray-300 bg-white transition-transform',
              isActive
                ? 'cursor-pointer hover:bg-gray-100'
                : 'cursor-not-allowed opacity-50',
            )}
            whileHover={isActive ? { scale: 1.05 } : {}}
            whileTap={isActive ? { scale: 0.95 } : {}}
            onClick={
              isActive ? () => handleEnterChannel(p.channelIndex) : undefined
            }
          >
            {isActive && (
              <>
                <div className='mb-3 flex flex-col items-center justify-center font-bold text-gray-700'>
                  <span className='text-base'>채널</span>
                  <span className='min-w-4 rounded-3xl bg-purple-500 p-1 text-center text-sm text-white lg:min-w-12'>
                    {channelData[p.channelIndex].channelId}
                  </span>
                </div>

                <div className='absolute flex w-full translate-y-12 flex-col items-center justify-center'>
                  <div className='h-[12px] w-[85%] overflow-hidden rounded-2xl bg-purple-800/20'>
                    <div
                      className={cn(
                        channelCongestion(
                          channelData[p.channelIndex].playerCount,
                          channelData[p.channelIndex].maxPlayers,
                        ).color,

                        'h-full w-full rounded-l-2xl bg-gradient-to-r',
                      )}
                      style={{
                        width: `${(channelData[p.channelIndex].playerCount / channelData[p.channelIndex].maxPlayers) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className='mt-2 text-xs text-fuchsia-200'>
                    {
                      channelCongestion(
                        channelData[p.channelIndex].playerCount,
                        channelData[p.channelIndex].maxPlayers,
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
              'absolute z-10 h-[45%] w-[6%] rounded-b-lg bg-gray-900 transition-transform',
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
