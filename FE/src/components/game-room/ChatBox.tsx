import { FormEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className='flex h-full w-full flex-col'>
      <div
        ref={chatContainerRef}
        className='neon-scrollbar flex-1 flex-wrap overflow-y-auto px-2 py-1'
      >
        {gameChattings.map((message, index) => (
          <div key={`${message.sender}-${index}`} className='mb-3'>
            {message.messageType === 'notice' ? (
              <div className='my-2 text-center'>
                <span className='inline-block rounded-full bg-black/20 px-3 py-1 text-sm text-white'>
                  {message.message}
                </span>
              </div>
            ) : (
              <div className='text-base text-white'>
                <span className='font-medium'>
                  {message.sender === currentUserId
                    ? `${message.sender}(나)`
                    : message.sender}
                </span>
                <span> : </span>
                <span>{message.message}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='mt-auto pt-2'>
        <form
          onSubmit={handleSendMessage}
          className='flex items-center space-x-2'
        >
          <div className='relative flex-1'>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder='메시지 입력...'
              className='h-10 w-full !rounded-none !border-0 !border-t-2 !border-t-[#30FFFF] bg-black/30 text-sm text-white placeholder-white/50 !outline-none'
              style={{
                boxShadow: 'none',
                borderTopColor: '#30FFFF',
                borderTopWidth: '2px',
                borderTopStyle: 'solid',
                borderRight: 'none',
                borderBottom: 'none',
                borderLeft: 'none',
              }}
            />
          </div>
          <Button
            type='submit'
            className='h-10 rounded-[40] bg-[#30FFFF] px-4 text-black hover:bg-[#30FFFF]/80'
          >
            <span className='text-sm'>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
