import { ReactNode } from 'react';

interface SocketLayoutProps {
  children: ReactNode;
}
const Layout = ({ children }: SocketLayoutProps) => {
  return <div className='flex min-h-screen w-screen'>{children}</div>;
};

export default Layout;
