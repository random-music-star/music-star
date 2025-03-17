import { FormEvent, useEffect, useRef, useState } from 'react';

import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameChatStore } from '@/stores/websocket/useGameChatStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

interface ChatBoxProps {
  currentUserId: string;
}

export default function ChatBox({ currentUserId }: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useWebSocketStore();
  const { gameChattings } = useGameChatStore();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [gameChattings]);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();

    if (!inputValue.trim()) return;

    sendMessage('/app/channel/1/room/1', {
      type: 'gameChat',
      request: {
        sender: currentUserId,
        message: inputValue,
      },
    });

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <div
        ref={chatContainerRef}
        className='flex-1 overflow-y-auto bg-white p-2 text-sm leading-relaxed'
      >
        {gameChattings.map((message, index) => (
          <div key={`${message.sender}-${index}`} className='mb-1'>
            {message.messageType === 'notice' ? (
              <div className='my-1 text-center'>
                <span className='inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600'>
                  {message.message}
                </span>
              </div>
            ) : (
              <div className='text-gray-800'>
                <span
                  className={`font-semibold ${message.sender === currentUserId ? 'text-indigo-600' : 'text-gray-700'}`}
                >
                  {message.sender === currentUserId ? '나' : message.sender}
                </span>

                <span>: </span>
                <span>{message.message}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='border-t border-gray-200 bg-gray-50 p-2'>
        <form onSubmit={handleSendMessage} className='flex space-x-1'>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='메시지 입력...'
            className='h-8 flex-1 text-xs'
          />
          <Button
            type='submit'
            size='sm'
            className='h-8 bg-indigo-600 hover:bg-indigo-700'
          >
            <Send size={14} className='mr-1' />
            <span className='text-xs'>전송</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
