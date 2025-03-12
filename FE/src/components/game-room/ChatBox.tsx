// pages/game-room/_components/ChatBox.tsx
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { chatMessages } from '../../_data/game-data';

interface ChatBoxProps {
  currentUserId: string;
}

export default function ChatBox({ currentUserId }: ChatBoxProps) {
  const [messages, setMessages] = useState(chatMessages);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 새 메시지가 추가되면 채팅창 맨 아래로 스크롤
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUserId,
      userName: '나',
      text: newMessage,
      timestamp,
    };

    setMessages(prev => [...prev, newChatMessage]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='flex flex-col h-full'>
      <div
        ref={chatContainerRef}
        className='flex-1 overflow-y-auto p-2 bg-white text-sm leading-relaxed'
      >
        {messages.map(message => (
          <div key={message.id} className='mb-1'>
            {message.isSystem ? (
              <div className='text-center my-1'>
                <span className='inline-block px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-600'>
                  {message.text}
                </span>
              </div>
            ) : (
              <div className='text-gray-800'>
                <span
                  className={`font-semibold ${message.userId === currentUserId ? 'text-indigo-600' : 'text-gray-700'}`}
                >
                  {message.userId === currentUserId ? '나' : message.userName}
                </span>
                <span className='text-gray-400 text-xs mx-1'>
                  ({message.timestamp})
                </span>
                <span>: </span>
                <span>{message.text}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 채팅 입력 영역 - 더 컴팩트하게 */}
      <div className='p-2 bg-gray-50 border-t border-gray-200'>
        <div className='flex space-x-1'>
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='메시지 입력...'
            className='flex-1 text-xs h-8'
          />
          <Button
            onClick={handleSendMessage}
            size='sm'
            className='bg-indigo-600 hover:bg-indigo-700 h-8'
          >
            <Send size={14} className='mr-1' />
            <span className='text-xs'>전송</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
