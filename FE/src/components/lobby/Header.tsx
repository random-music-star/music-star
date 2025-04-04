import { useRouter } from 'next/router';

import { useAuth } from '@/hooks/useAuth';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

interface HeaderProps {
  channelId: string;
}

export default function Header({ channelId }: HeaderProps) {
  const { logout } = useAuth();
  const { nickname } = useNicknameStore();
  const router = useRouter();

  const handleChannelExit = () => {
    router.push('/');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className='flex items-center justify-between bg-[#8352D1]/80 px-5 py-2 text-white'>
      <section className='flex items-center'>
        <h1 className='mr-6 text-xl font-bold'>랜덤뮤직스타</h1>
        <span className='mr-3'>채널 {channelId}</span>
      </section>
      <section className='flex items-center justify-end'>
        <span className='mr-3'>{nickname}님 환영합니다</span>
      </section>
      <section>
        <button
          onClick={handleChannelExit}
          className='mr-2 cursor-pointer rounded bg-[#6548B9] px-3 py-1'
        >
          채널 나가기
        </button>
        <button
          onClick={handleLogout}
          className='cursor-pointer rounded bg-[#6548B9] px-3 py-1'
        >
          로그아웃
        </button>
      </section>
    </header>
  );
}
