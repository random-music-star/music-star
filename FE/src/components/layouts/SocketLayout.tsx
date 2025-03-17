import { ReactNode, useEffect } from 'react';

import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

interface SocketLayoutProps {
  children: ReactNode;
}
const SocketLayout = ({ children }: SocketLayoutProps) => {
  const { connectWebSocket, disconnectWebSocket } = useWebSocketStore();

  useEffect(() => {
    connectWebSocket();

    return () => disconnectWebSocket();
  }, []);

  return (
    <div className='flex max-h-screen min-h-screen max-w-screen min-w-screen flex-col'>
      {children}
    </div>
  );
};

export default SocketLayout;
