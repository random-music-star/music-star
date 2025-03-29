import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Toaster } from 'sonner';

import SocketLayout from '@/components/layouts/SocketLayout';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  if (router.pathname.startsWith('/game')) {
    return (
      <SocketLayout>
        <Component {...pageProps} />
        <Toaster />
      </SocketLayout>
    );
  }

  return (
    <>
      <Toaster />
      <Component {...pageProps} />
    </>
  );
}
