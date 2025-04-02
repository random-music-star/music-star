import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGameChatStore } from '@/stores/websocket/useGameChatStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';
import { Chatting } from '@/types/websocket';

import SpeechBubble from '../gamePlaySection/SpeechBubble';

interface ReadyPanelProps {
  currentUserId: string;
  handleStartGame: () => void;
  roomId: string;
  channelId: string;
}

const ReadyPanel = ({
  currentUserId,
  handleStartGame,
  roomId,
  channelId,
}: ReadyPanelProps) => {
  const { participantInfo, isAllReady, hostNickname } =
    useParticipantInfoStore();
  const { gameRoomInfo } = useGameInfoStore();
  const { gameChattings } = useGameChatStore();
  const { sendMessage } = useWebSocketStore();

  const [chattingMap, setChattingMap] = useState<
    Record<string, { message: string; timestamp: number }>
  >({});
  const [shakingMap, setShakingMap] = useState<Record<string, boolean>>({});

  const handleToggleReady = () => {
    const currentPlayer = participantInfo.find(
      user => user.userName === currentUserId,
    );
    if (!currentPlayer) return;
    sendMessage(`/app/channel/${channelId}/room/${roomId}/ready`, {
      type: 'ready',
      username: currentUserId,
    });
  };

  const handleSpeech = (chat: Chatting) => {
    const now = Date.now();

    setChattingMap(prev => ({
      ...prev,
      [chat.sender]: { message: chat.message, timestamp: now },
    }));

    if (participantInfo.find(p => p.userName === chat.sender)?.isReady) {
      // 레디 상태일 때만 실행
      setShakingMap(prev => ({
        ...prev,
        [chat.sender]: true,
      }));

      setTimeout(() => {
        setShakingMap(prev => {
          const updated = { ...prev };
          delete updated[chat.sender];
          return updated;
        });
      }, 1000);
    }

    setTimeout(() => {
      setChattingMap(prev => {
        const current = prev[chat.sender];
        if (current?.timestamp !== now) return prev;

        const updated = { ...prev };
        delete updated[chat.sender];
        return updated;
      });
    }, 2000);
  };

  useEffect(() => {
    if (
      gameChattings.at(-1) &&
      gameChattings.at(-1)?.messageType === 'default'
    ) {
      handleSpeech(gameChattings.at(-1)!);
    }
  }, [gameChattings]);

  if (!gameRoomInfo) return null;

  const getStaffPosition = (index: number) => {
    const basePositions = [
      { x: 15, y: 125 },
      { x: 30, y: 225 },
      { x: 45, y: 145 },
      { x: 60, y: 165 },
      { x: 73, y: 245 },
      { x: 82, y: 117 },
    ];

    return {
      left: `${basePositions[index % basePositions.length].x}%`,
      top: `${basePositions[index % basePositions.length].y}px`,
      bottom: undefined,
    };
  };

  const getWaitingPosition = (index: number) => {
    const basePositions = [
      { x: 12, y: 100 },
      { x: 27, y: 120 },
      { x: 42, y: 90 },
      { x: 57, y: 60 },
      { x: 72, y: 90 },
      { x: 87, y: 70 },
    ];

    return {
      left: `${basePositions[index % basePositions.length].x}%`,
      top: undefined,
      bottom: `${basePositions[index % basePositions.length].y}px`,
    };
  };

  const shakeAnimation = {
    rotate: [0, -5, 5, -5, 5, -3, 3, -2, 2, 0],
    transition: {
      duration: 1,
      ease: 'easeInOut',
      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
      repeatType: 'loop' as const,
      repeat: 0,
    },
  };

  return (
    <div className='relative h-full w-full overflow-hidden'>
      <div className='relative mt-[100px] h-[40%] w-full'>
        <Image
          src='/staff.png'
          alt='Musical Staff'
          fill
          className='object-cover'
          priority
        />
      </div>
      <div className='absolute inset-0'>
        {participantInfo.map((participant, index) => {
          const isReady = participant.isReady;
          const staffPos = getStaffPosition(index);
          const waitPos = getWaitingPosition(index);

          const position = isReady ? staffPos : waitPos;
          const isShaking = shakingMap[participant.userName];

          return (
            <motion.div
              key={participant.userName}
              className='absolute'
              initial={false}
              animate={position}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                mass: 1,
              }}
            >
              <div className='relative flex flex-col items-center'>
                <div className='absolute bottom-23 left-20 mb-2 w-max max-w-[200px]'>
                  {chattingMap[participant.userName]?.message && (
                    <SpeechBubble
                      text={chattingMap[participant.userName].message}
                      isInProgress={false}
                    />
                  )}
                </div>
                <motion.div
                  className={cn(
                    !isReady && !isShaking && 'animate-bounce',
                    'relative h-20 w-16 md:h-24 md:w-20',
                  )}
                  animate={isShaking ? shakeAnimation : {}}
                >
                  <Image
                    src={participant.character}
                    alt={`${participant.userName}'s character`}
                    fill
                    className='object-contain'
                  />
                </motion.div>
                <div className='mt-1'>
                  <span className='text-sm text-white'>
                    {participant.userName}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className='absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-5'>
        <Button
          onClick={handleToggleReady}
          className={cn(
            !participantInfo.find(user => user.userName === currentUserId)
              ?.isReady && 'bg-cyan-500 text-black/50 hover:bg-cyan-600',
            participantInfo.find(user => user.userName === currentUserId)
              ?.isReady && 'bg-gray-600 text-black/50 hover:bg-gray-700',
            'tracking-super-wide rounded-3xl px-6 py-5 text-lg font-semibold sm:px-10 sm:py-6 sm:text-xl',
          )}
        >
          {participantInfo.find(user => user.userName === currentUserId)
            ?.isReady
            ? '준비취소'
            : '준비하기'}
        </Button>
        {isAllReady && currentUserId === hostNickname && (
          <Button
            onClick={handleStartGame}
            className='rounded-3xl bg-purple-400 px-6 py-5 text-lg hover:bg-purple-500 sm:px-10 sm:py-6 sm:text-xl'
          >
            <span>게임 시작</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReadyPanel;
