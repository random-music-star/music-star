import { deleteCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { guestLoginAPI, userLoginAPI, userSignupAPI } from '@/api/auth';

export interface UserCredentials {
  username: string;
  password: string;
}

export function useAuth() {
  const router = useRouter();

  const guestLogin = async () => {
    const { success, data, error } = await guestLoginAPI();
    if (success) {
      setCookie('accessToken', data.accessToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      toast.success('비회원으로 로그인했습니다.');
    } else {
      toast.error(error);
    }
  };

  const signUp = async ({ username, password }: UserCredentials) => {
    const { success, error } = await userSignupAPI({
      username,
      password,
    });
    if (success) {
      toast.success('회원가입 성공', {
        description: '환영합니다!',
      });
    } else {
      toast.error(error);
    }
  };

  const userLogin = async ({ username, password }: UserCredentials) => {
    const { success, data, error } = await userLoginAPI({ username, password });
    if (success) {
      setCookie('accessToken', data.accessToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      toast.success('로그인 성공', {
        description: '환영합니다!',
      });
    } else {
      toast.error(error);
    }
  };

  const logout = () => {
    try {
      deleteCookie('userNickname', { path: '/' });
      toast.success('로그아웃 되었습니다.');
      router.push('/');
    } catch {
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return { guestLogin, signUp, userLogin, logout };
}
