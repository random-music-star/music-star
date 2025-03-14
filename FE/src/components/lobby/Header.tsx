import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

export default function Header({ nickname }: { nickname: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className='bg-[hsl(var(--color-header-bg))] text-black p-4 shadow-md'>
      <div className='container mx-auto flex justify-between items-center'>
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
