import { FormEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useGameChatStore } from '@/stores/websocket/useGameChatStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

interface ChatBoxProps {
  currentUserId: string;
  roomId: string;
  channelId: string;
}

const ChatBox = ({ currentUserId, roomId, channelId }: ChatBoxProps) => {
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { gameChattings } = useGameChatStore();
  const { sendMessage } = useWebSocketStore();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [gameChattings]);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();

    if (!inputValue.trim()) return;

    sendMessage(`/app/channel/${channelId}/room/${roomId}`, {
      type: 'gameChat',
      request: {
        sender: currentUserId,
        message: inputValue,
      },
    });

    setInputValue('');
  };

  return (
    <div className='flex w-full flex-1 grow flex-col overflow-hidden bg-black/50 pt-3 text-white backdrop-blur-md'>
      <div
        ref={chatContainerRef}
        className='neon-scrollbar flex-1 grow overflow-y-auto px-2 py-2'
        style={{ height: 'calc(100% - 90px)' }}
      >
        {gameChattings.map((message, index) => (
          <div key={`${message.sender}-${index}`} className='mb-2'>
            {message.messageType === 'notice' && (
              <div className='my-2 text-center'>
                <span className='inline-block rounded-full bg-purple-500/80 px-3 py-1 text-sm tracking-tight text-white'>
                  {message.message}
                </span>
              </div>
            )}
            {message.messageType === 'winner' && (
              <div className='my-3'>
                <div className='rounded-lg bg-gradient-to-r from-cyan-600/80 via-cyan-500/80 to-cyan-600/80 p-0.5 shadow-lg'>
                  <div className='flex w-full flex-col items-center justify-center gap-1 rounded-md bg-cyan-900/90 p-2 text-center'>
                    <div className='mb-1 text-lg font-bold text-cyan-300'>
                      🎉 정답자 등장! 🎉
                    </div>
                    <div className='text-base font-medium text-white'>
                      {message.message}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {message.messageType === 'warning' && (
              <div className='my-3'>
                <div className='rounded-lg bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 p-0.5 shadow-lg'>
                  <div className='flex w-full flex-col items-center justify-center gap-1 rounded-md bg-amber-700/50 p-2 text-center'>
                    <div className='text-base font-medium text-white'>
                      {message.message}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message.messageType === 'default' && (
              <div className='flex flex-wrap items-center space-x-1 text-sm'>
                <p
                  className={cn(
                    message.sender === currentUserId
                      ? 'text-cyan-300'
                      : 'text-fuchsia-200',
                    `text-sm font-medium tracking-tight`,
                  )}
                >
                  {message.sender === currentUserId
                    ? `${message.sender}(나)`
                    : message.sender}
                  <span className='mr-2 text-sm text-fuchsia-300'>:</span>
                  <span className='text-white'>{message.message}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='border-t border-gray-700/50 bg-gray-900/70 px-2 py-2'>
        <form
          onSubmit={handleSendMessage}
          className='flex items-center gap-1 space-x-1'
        >
          <div className='relative flex-1'>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder='메시지 입력...'
              className='h-8 w-full rounded-md border-0 bg-gray-700 text-sm tracking-tight text-white placeholder-gray-200/70 focus:ring-1 focus:ring-cyan-400/50'
            />
          </div>
          <Button
            type='submit'
            className='h-8 rounded-md bg-cyan-400 px-3 text-black hover:bg-cyan-300'
          >
            <span className='text-xs font-medium tracking-tight'>전송</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
