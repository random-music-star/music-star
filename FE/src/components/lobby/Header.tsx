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
  };

  return (
    <header className='flex items-center justify-between bg-gradient-to-b from-[#8352D1] to-[#8352D1]/60 px-5 py-2 text-white'>
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
          className='mr-2 cursor-pointer rounded-2xl bg-gradient-to-b from-[#061834]/20 to-[#061834]/50 px-4 py-1.5 text-xs shadow-md transition-all duration-300 hover:from-[#061834]/50 hover:to-[#061834]/80'
        >
          채널 나가기
        </button>
        <button
          onClick={handleLogout}
          className='cursor-pointer rounded-2xl bg-gradient-to-b from-[#061834]/20 to-[#061834]/50 px-4 py-1.5 text-xs shadow-md transition-all duration-300 hover:from-[#061834]/50 hover:to-[#061834]/80'
        >
          로그아웃
        </button>
      </section>
    </header>
  );
}
