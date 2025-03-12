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

  return <div className='flex flex-col min-h-screen w-screen'>{children}</div>;
};

export default SocketLayout;
