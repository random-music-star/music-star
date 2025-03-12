import { ReactNode } from 'react';

interface SocketLayoutProps {
  children: ReactNode;
}
const SocketLayout = ({ children }: SocketLayoutProps) => {
  return (
    <div className='flex flex-col h-screen w-screen flex-col bg-indigo-400'>
      {children}
    </div>
  );
};

export default SocketLayout;
