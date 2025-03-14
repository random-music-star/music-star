import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';
import { ReactNode, useEffect } from 'react';

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
    <div className='flex flex-col min-h-screen min-w-screen max-w-screen max-h-screen '>
      {children}
    </div>
  );
};

export default SocketLayout;
