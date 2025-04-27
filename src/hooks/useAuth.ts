import { deleteCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { guestLoginAPI, userLoginAPI, userSignupAPI } from '@/api/auth';
import { userNicknameAPI } from '@/api/member';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

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

      const { success: nicknameSuccess, data: nicknameData } =
        await userNicknameAPI();

      if (nicknameSuccess) {
        useNicknameStore.getState().setNickname(nicknameData.username);
      }
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

      const { success: nicknameSuccess, data: nicknameData } =
        await userNicknameAPI();

      if (nicknameSuccess) {
        useNicknameStore.getState().setNickname(nicknameData.username);
      }
    } else {
      toast.error(error);
    }
  };

  const logout = () => {
    try {
      deleteCookie('accessToken', { path: '/' });
      toast.success('로그아웃 되었습니다.');
      router.push('/');
      useNicknameStore.getState().setNickname('');
    } catch {
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return { guestLogin, signUp, userLogin, logout };
}
