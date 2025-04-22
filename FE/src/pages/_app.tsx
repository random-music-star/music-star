import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Toaster } from 'sonner';

import MobileWarning from '@/components/MobileWarning';
import SocketLayout from '@/components/layouts/SocketLayout';
import GoogleAnalytics from '@/lib/GoogleAnalytics';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  if (router.pathname.startsWith('/game')) {
    return (
      <SocketLayout>
        <GoogleAnalytics />
        <MobileWarning />
        <Component {...pageProps} />
        <Toaster />
      </SocketLayout>
    );
  }

  return (
    <>
      <GoogleAnalytics />
      <MobileWarning />
      <Toaster />
      <Component {...pageProps} />
    </>
  );
}
