import { deleteCookie, setCookie } from 'cookies-next';

export function useAuth() {
  const login = (token: string) => {
    setCookie('userNickname', token, { maxAge: 60 * 60 * 24 * 7, path: '/' });
  };

  const logout = () => {
    deleteCookie('userNickname', { path: '/' });
  };

  return { login, logout };
}
