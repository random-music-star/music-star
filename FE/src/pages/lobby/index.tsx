import { useEffect, useState } from 'react';
import SocketLayout from '@/components/layouts/SocketLayout';
import { useWebSocketStore } from '@/stores/useWebsocketStore';

const LobbyPage = () => {
  const { sendMessage, updateSubscription, isConnected, publicChattings } =
    useWebSocketStore();
  const [inputValue, setInputValue] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    updateSubscription('channel');
  }, [isConnected]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('입력된 값:', inputValue);
    sendMessage('/app/channel/1', {
      type: 'chatting',
      request: {
        sender: 'hoberMin',
        message: inputValue,
      },
    });

    setInputValue('');
  };

  return (
    <SocketLayout>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={inputValue}
          onChange={handleChange}
          placeholder='입력하세요'
        />
        <button type='submit'>전송</button>
      </form>
      <div>
        {publicChattings.map(chat => (
          <p>{`[${chat.messageType}] ${chat.sender}: ${chat.message}`}</p>
        ))}
      </div>
    </SocketLayout>
  );
};

export default LobbyPage;
