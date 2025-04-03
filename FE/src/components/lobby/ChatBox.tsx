import { FormEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { usePublicChatStore } from '@/stores/websocket/usePublicChatStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';
import { Chatting } from '@/types/websocket';

export default function ChatBox({ channelId }: { channelId: string }) {
  const { nickname } = useNicknameStore();
  const [newMessage, setNewMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { sendMessage, updateSubscription, isConnected, checkSubscription } =
    useWebSocketStore();
  const { publicChattings } = usePublicChatStore();

  useEffect(() => {
    if (isConnected && !checkSubscription('channel')) {
      updateSubscription('channel', channelId);
    }
  }, [isConnected]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [publicChattings]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newChatting: Chatting = {
      sender: nickname,
      messageType: 'CHAT',
      message: newMessage,
    };

    sendMessage(`/app/channel/${channelId}`, {
      type: 'chatting',
      request: newChatting,
    });

    setNewMessage('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className='flex h-full flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* <div className='rounded-t-lg border-b border-[#30FFFF] px-4 py-3 text-white shadow-sm'>
        <h2 className='text-lg font-semibold'>전체 채팅</h2>
      </div> */}
      <div
        ref={chatContainerRef}
        className='neon-scrollbar flex-1 space-y-2 overflow-y-auto p-4'
      >
        {publicChattings.length === 0 ? (
          <div className='py-6 text-center text-[#30FFFF]/50'>
            채팅 메시지가 없습니다.
          </div>
        ) : (
          publicChattings.map((chat, index) => (
            <div key={index} className='mb-3 text-sm leading-relaxed'>
              {chat.messageType === 'NOTICE' ? (
                <div className='my-2 text-center'>
                  <span className='inline-block rounded-full bg-black/20 px-3 py-1 text-sm text-white'>
                    <span className='font-semibold text-[#30FFFF]'>[공지]</span>{' '}
                    {chat.message}
                  </span>
                </div>
              ) : (
                <div className='text-base text-white'>
                  <span className='font-medium'>
                    {chat.sender === nickname
                      ? `${chat.sender}(나)`
                      : chat.sender}
                  </span>
                  <span> : </span>
                  <span>{chat.message}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className='mt-auto pt-2'>
        <form
          onSubmit={handleSubmit}
          className='flex items-center space-x-2 p-3'
        >
          <div className='relative flex-1'>
            <Input
              type='text'
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder='메시지를 입력하세요...'
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
            disabled={!newMessage.trim()}
            className='h-10 rounded-[40] bg-[#30FFFF] px-4 text-black hover:bg-[#30FFFF]/80'
          >
            <span className='text-sm'>전송</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
