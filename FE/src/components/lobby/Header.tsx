import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export default function Header({ nickname }: { nickname: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className='bg-[hsl(var(--color-header-bg))] p-4 text-black shadow-md'>
      <div className='container mx-auto flex items-center justify-between'>
        <h1 className='text-xl font-bold text-black'>알송달송</h1>

        <div className='flex items-center gap-2'>
          {nickname && (
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
          )}
        </div>
      </div>
    </header>
  );
}
