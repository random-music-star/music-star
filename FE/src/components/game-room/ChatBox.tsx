import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWebSocketStore } from '@/stores/useWebsocketStore';

interface ChatBoxProps {
  currentUserId: string;
}

export default function ChatBox({ currentUserId }: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { sendMessage, gameChattings } = useWebSocketStore();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [gameChattings]);

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputValue.trim()) return;

    console.log('입력된 값:', inputValue);
    sendMessage('/app/channel/1/room/1', {
      type: 'gameChat',
      request: {
        sender: 'hoberMin',
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
    <div className='flex flex-col h-full'>
      <div
        ref={chatContainerRef}
        className='flex-1 overflow-y-auto p-2 bg-white text-sm leading-relaxed'
      >
        {gameChattings.map(message => (
          <div key={message.sender} className='mb-1'>
            {message.messageType === 'notice' ? (
              <div className='text-center my-1'>
                <span className='inline-block px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-600'>
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

      <div className='p-2 bg-gray-50 border-t border-gray-200'>
        <form onSubmit={handleSendMessage} className='flex space-x-1'>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='메시지 입력...'
            className='flex-1 text-xs h-8'
          />
          <Button
            type='submit'
            size='sm'
            className='bg-indigo-600 hover:bg-indigo-700 h-8'
          >
            <Send size={14} className='mr-1' />
            <span className='text-xs'>전송</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
