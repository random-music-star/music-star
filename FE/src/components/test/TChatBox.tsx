import { FormEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameChatStore } from '@/stores/websocket/useGameChatStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

interface TChatBoxProps {
  currentUserId: string;
  roomId: string;
}

const TChatBox = ({ currentUserId, roomId }: TChatBoxProps) => {
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { gameChattings } = useGameChatStore();
  const { sendMessage } = useWebSocketStore();

  // 더미 데이터 생성
  const dummyChats = [
    { sender: '아이유', message: '안녕하세요!', messageType: 'chat' },
    { sender: '좋은날', message: '게임 시작할까요?', messageType: 'chat' },
    {
      messageType: 'notice',
      message: '게임이 곧 시작됩니다',
      sender: 'system',
    },
    { sender: currentUserId, message: '네 좋아요!', messageType: 'chat' },
    { sender: '아이유', message: '준비 완료했어요', messageType: 'chat' },
  ];

  // 실제 채팅이 없을 경우 더미 데이터 사용
  const chats = gameChattings.length > 2 ? gameChattings : dummyChats;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();

    if (!inputValue.trim()) return;

    sendMessage(`/app/channel/1/room/${roomId}`, {
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
      <div ref={chatContainerRef} className='flex-1 overflow-y-auto px-2 py-1'>
        {/* 스크롤 로직 추가해야 함  */}
        {chats.map((message, index) => (
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

      <div className='pt-2'>
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

export default TChatBox;
