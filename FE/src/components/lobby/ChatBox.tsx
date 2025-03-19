import { FormEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { usePublicChatStore } from '@/stores/websocket/usePublicChatStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';
import { Chatting } from '@/types/websocket';

export default function ChatBox() {
  const { nickname } = useNicknameStore();
  const [newMessage, setNewMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { sendMessage, updateSubscription, isConnected, checkSubscription } =
    useWebSocketStore();
  const { publicChattings } = usePublicChatStore();

  useEffect(() => {
    if (isConnected && !checkSubscription('channel')) {
      updateSubscription('channel');
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

    sendMessage('/app/channel/1', {
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
    <div className='flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='rounded-t-lg bg-blue-600 px-4 py-3 text-white shadow-sm'>
        <h2 className='text-lg font-semibold'>로비 채팅</h2>
      </div>

      <div
        ref={chatContainerRef}
        className='flex-1 space-y-2 overflow-y-auto bg-white p-4'
      >
        {publicChattings.length === 0 ? (
          <div className='py-6 text-center text-gray-500'>
            채팅 메시지가 없습니다.
          </div>
        ) : (
          publicChattings.map((chat, index) => (
            <div key={index} className='text-sm leading-relaxed'>
              {chat.messageType === 'NOTICE' ? (
                <div className='my-2 rounded bg-gray-100 px-3 py-1 text-center text-gray-700'>
                  <span className='font-semibold text-red-500'>[공지]</span>{' '}
                  {chat.message}
                </div>
              ) : (
                <div className='flex'>
                  <span className='mr-1 font-medium'>{chat.sender}:</span>
                  <span>{chat.message}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className='border-t border-gray-200 bg-white p-3'>
        <form onSubmit={handleSubmit} className='flex gap-2'>
          <div className='flex-1'>
            <input
              type='text'
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder='메시지를 입력하세요...'
              className='h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
          </div>
          <Button
            type='submit'
            disabled={!newMessage.trim()}
            className='h-10 self-end rounded-lg bg-blue-600 px-4 text-white transition-colors hover:bg-blue-700'
          >
            전송
          </Button>
        </form>
      </div>
    </div>
  );
}
