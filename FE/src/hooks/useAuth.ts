import { deleteCookie, setCookie } from 'cookies-next';

import { useNicknameStore } from '@/stores/auth/useNicknameStore';

export function useAuth() {
  const { setNickname } = useNicknameStore();
  const login = async () => {
    const { username } = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/member/guest/login`,
    )
      .then(res => res.json())
      .then(data => data as { username: string });

    setCookie('userNickname', username, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    setNickname(username);
  };

  const logout = () => {
    deleteCookie('userNickname', { path: '/' });
    setNickname('');
  };

  return { login, logout };
}
