import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export default function Header() {
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('userNickname');
      setNickname(storedNickname || '');
      setIsLoading(false);
    }
  }, []);

  const handleGuestLogin = () => {
    // 추후 로그인정보 fetch로 수정
    const guestNickname = `게스트${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('userNickname', guestNickname);
    setNickname(guestNickname);
  };

  const handleLogout = () => {
    localStorage.removeItem('userNickname');
    setNickname('');
  };

  return (
    <header className='bg-[hsl(var(--color-header-bg))] text-black p-4 shadow-md'>
      <div className='container mx-auto flex justify-between items-center'>
        <h1 className='text-xl font-bold text-black'>알송달송</h1>

        <div className='flex items-center gap-2'>
          {isLoading ? (
            <span className='text-black'>로딩 중...</span>
          ) : nickname ? (
            <DropdownMenu>
              <DropdownMenuTrigger className='flex items-center gap-1 text-black'>
                <span>{nickname}</span>
                <ChevronDown className='h-4 w-4' />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className='cursor-pointer'
                >
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={handleGuestLogin}
              className='px-4 py-2 bg-[hsl(var(--color-primary))] text-white rounded hover:bg-opacity-90 transition-colors'
            >
              게스트 로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
