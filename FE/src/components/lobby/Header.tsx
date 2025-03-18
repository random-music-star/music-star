import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

import { Button } from '../ui/button';

export default function Header() {
  const { login, logout } = useAuth();
  const { nickname } = useNicknameStore();

  return (
    <header className='bg-[hsl(var(--color-header-bg))] p-4 text-black shadow-md'>
      <div className='container mx-auto flex items-center justify-between'>
        <h1 className='text-xl font-bold text-black'>알송달송</h1>

        <div className='flex items-center gap-2'>
          {nickname ? (
            <DropdownMenu>
              <DropdownMenuTrigger className='flex items-center gap-1 text-black'>
                <span>{nickname}</span>
                <ChevronDown className='h-4 w-4' />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => logout()}
                  className='cursor-pointer'
                >
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <main className='row-start-2 flex flex-col items-center gap-8 sm:items-start'>
              <Button onClick={() => login()}>게스트 로그인</Button>
            </main>
          )}
        </div>
      </div>
    </header>
  );
}
