import { deleteCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { useNicknameStore } from '@/stores/auth/useNicknameStore';

interface UserCredentials {
  username: string;
  password: string;
}

interface GuestLoginResponse {
  username: string;
}

export function useAuth() {
  const { setNickname } = useNicknameStore();
  const router = useRouter();

  const guestLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/member/guest/login`,
      );

      if (!response.ok) {
        toast.error('비회원 로그인에 실패했습니다.');
        return null;
      }

      const { username }: GuestLoginResponse = await response.json();

      setCookie('userNickname', username, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      setNickname(username);
      toast.success('비회원으로 로그인했습니다.');

      return { username };
    } catch {
      toast.error('비회원 로그인 중 오류가 발생했습니다.');
      return null;
    }
  };

  const signUp = async ({ username, password }: UserCredentials) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/member/user/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('중복된 회원입니다.');
        } else if (response.status === 500) {
          toast.error(
            '서버 내부 오류가 발생했습니다. 나중에 다시 시도해주세요.',
          );
        } else {
          const { message } = (await response.json()) as { message: string };
          toast.error(message);
        }
        return null;
      }

      let result = { success: true };

      const text = await response.text();
      if (text && text.trim()) {
        result = JSON.parse(text);
      }

      toast.success('회원가입이 완료되었습니다.');
      return result;
    } catch {
      toast.error('회원가입 중 오류가 발생했습니다.');
      return null;
    }
  };

  const userLogin = async ({ username, password }: UserCredentials) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/member/user/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('로그인 정보가 올바르지 않습니다.');
        } else {
          toast.error(`로그인에 실패했습니다.`);
        }
        return null;
      }

      let userData;

      try {
        const text = await response.text();
        if (text && text.trim()) {
          userData = JSON.parse(text);
        }
      } catch {
        userData = { username };
      }

      if (!userData || !userData.username) {
        userData = { username };
      }

      setCookie('userNickname', userData.username, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      setNickname(userData.username);
      toast.success('로그인 성공', {
        description: '환영합니다!',
      });

      return userData;
    } catch {
      toast.error('로그인 중 오류가 발생했습니다.');
      return null;
    }
  };

  const logout = () => {
    try {
      deleteCookie('userNickname', { path: '/' });
      setNickname('');
      toast.success('로그아웃 되었습니다.');
      router.push('/');
    } catch {
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return { guestLogin, signUp, userLogin, logout };
}
