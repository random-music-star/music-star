import { FormEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameChatStore } from '@/stores/websocket/useGameChatStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

interface ScoreChatBoxProps {
  currentUserId: string;
  roomId: string;
  channelId: string;
}

const ScoreChatBox = ({
  currentUserId,
  roomId,
  channelId,
}: ScoreChatBoxProps) => {
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
    <div className='flex h-full w-full flex-col overflow-hidden rounded-lg border border-purple-800/50 bg-purple-900/50 shadow-lg backdrop-blur-sm'>
      <div className='border-b border-purple-700/50 bg-purple-800/70 px-3 py-1'>
        <h3 className='text-sm font-bold tracking-tight text-purple-100'>
          채팅
        </h3>
      </div>

      <div
        ref={chatContainerRef}
        className='neon-scrollbar flex-1 overflow-y-auto px-2 py-2'
        style={{ height: 'calc(100% - 90px)' }}
      >
        {gameChattings.map((message, index) => (
          <div key={`${message.sender}-${index}`} className='mb-2'>
            {message.messageType === 'notice' && (
              <div className='my-2 text-center'>
                <span className='inline-block rounded-full bg-purple-700/40 px-3 py-1 text-sm tracking-tight text-purple-100'>
                  {message.message}
                </span>
              </div>
            )}

            {message.messageType === 'winner' && (
              <div className='my-3'>
                <div className='rounded-lg bg-gradient-to-r from-purple-600/80 via-cyan-500/80 to-purple-600/80 p-0.5 shadow-lg'>
                  <div className='flex w-full items-center justify-center gap-10 rounded-md bg-purple-900/90 p-2 text-center'>
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
              <div className='flex items-start space-x-1'>
                <div className='w-[100px] flex-shrink-0 overflow-hidden'>
                  <span
                    className={`inline-block truncate text-sm font-medium tracking-tight ${
                      message.sender === currentUserId
                        ? 'text-cyan-300'
                        : 'text-purple-200'
                    }`}
                  >
                    {message.sender === currentUserId
                      ? `${message.sender}(나)`
                      : message.sender}
                  </span>
                </div>
                <span className='text-sm text-purple-300'>:</span>
                <span className='flex-1 text-sm tracking-tight break-words text-white'>
                  {message.message}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='border-t border-purple-700/50 bg-purple-900/70 px-2 py-2'>
        <form
          onSubmit={handleSendMessage}
          className='flex items-center space-x-1'
        >
          <div className='relative flex-1'>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder='메시지 입력...'
              className='h-8 w-full rounded-md border-0 bg-purple-800/50 text-sm tracking-tight text-white placeholder-purple-300/70 focus:ring-1 focus:ring-cyan-400/50'
            />
          </div>
          <Button
            type='submit'
            className='h-8 rounded-md bg-cyan-500 px-3 text-black hover:bg-cyan-400'
          >
            <span className='text-xs font-medium tracking-tight'>전송</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ScoreChatBox;
