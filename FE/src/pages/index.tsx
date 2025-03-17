import { Geist, Geist_Mono } from 'next/font/google';
import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function Home() {
  const { login } = useAuth();
  const router = useRouter();

  const handleGuestLogin = async () => {
    // 추후 로그인정보 fetch로 수정
    const { token } = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/member/guest/login`,
    )
      .then(res => res.json())
      .then(data => data as { token: string });

    login(token);
    router.push('/lobby');
  };

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20`}
    >
      <main className='row-start-2 flex flex-col items-center gap-8 sm:items-start'>
        <Button onClick={handleGuestLogin}>게스트 로그인</Button>
      </main>
    </div>
  );
}
