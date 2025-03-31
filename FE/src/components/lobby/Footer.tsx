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
    <footer className='flex items-center justify-between bg-[#6548B9] px-5 py-2 text-white'>
      {/* 서비스 관련 정보 */}
      <section className='flex items-center'>
        <h1 className='mr-6 text-xl font-bold'>알송달송</h1>
        {/* 채널 */}
        <span className='mr-3'>채널 {channelId}</span>
        <button
          onClick={handleChannelExit}
          className='cursor-pointer rounded bg-[#8352D1] px-3 py-1'
        >
          채널 나가기
        </button>
      </section>
      {/* 회원 관련 정보 */}
      <section className='flex items-center justify-end'>
        <span className='mr-3'>{nickname}</span>
        <button
          onClick={handleLogout}
          className='cursor-pointer rounded bg-red-500 px-3 py-1'
        >
          로그아웃
        </button>
      </section>
    </footer>
  );
}
