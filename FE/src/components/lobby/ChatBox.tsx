import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';
import { usePublicChatStore } from '@/stores/websocket/usePublicChatStore';

export interface Chatting {
  sender: string;
  messageType: string;
  message: string;
}

export default function ChatBox() {
  const userNickname = '알송이';

  const [newMessage, setNewMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { sendMessage, updateSubscription, isConnected } = useWebSocketStore();
  const { publicChattings } = usePublicChatStore();

  useEffect(() => {
    if (isConnected) {
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
      sender: userNickname,
      messageType: 'CHAT',
      message: newMessage,
    };

    sendMessage('/app/channel/1', {
      type: 'chatting',
      request: newChatting,
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  return (
    <div className='flex flex-col h-full border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden'>
      <div className='bg-blue-600 text-white px-4 py-3 rounded-t-lg shadow-sm'>
        <h2 className='text-lg font-semibold'>로비 채팅</h2>
      </div>

      <div
        ref={chatContainerRef}
        className='flex-1 overflow-y-auto p-4 space-y-2 bg-white'
      >
        {publicChattings.length === 0 ? (
          <div className='text-center text-gray-500 py-6'>
            채팅 메시지가 없습니다.
          </div>
        ) : (
          publicChattings.map((chat, index) => (
            <div key={index} className='text-sm leading-relaxed'>
              {chat.messageType === 'NOTICE' ? (
                <div className='bg-gray-100 text-gray-700 py-1 px-3 rounded text-center my-2'>
                  <span className='text-red-500 font-semibold'>[공지]</span>{' '}
                  {chat.message}
                </div>
              ) : (
                <div className='flex'>
                  <span className='font-medium mr-1'>{chat.sender}:</span>
                  <span>{chat.message}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className='p-3 border-t border-gray-200 bg-white'>
        <div className='flex gap-2'>
          <div className='flex-1'>
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder='메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)'
              className='w-full resize-none border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              rows={2}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className='self-end h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            전송
          </Button>
        </div>
      </div>
    </div>
  );
}
