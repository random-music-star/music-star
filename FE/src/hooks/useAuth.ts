import { deleteCookie, setCookie } from 'cookies-next';

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

  // 비회원 로그인
  const guestLogin = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/member/guest/login`,
    );
    const { username }: GuestLoginResponse = await response.json();

    setCookie('userNickname', username, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    setNickname(username);
  };

  // 회원 가입
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

      // 응답이 성공적인지 확인
      if (!response.ok) {
        // 401 상태 코드는 "이미 존재하는 회원입니다" 반환
        if (response.status === 401) {
          const errorText = await response.text();
          throw new Error(errorText || '이미 존재하는 회원입니다.');
        }

        // 그 외 실패 상태 코드
        throw new Error(`회원가입 실패: ${response.status}`);
      }

      // 성공적인 응답 처리 (응답 본문이 없을 수 있음)
      try {
        const text = await response.text();
        if (text && text.trim()) {
          return JSON.parse(text);
        }
      } catch {
        // 응답 파싱에 실패하거나 응답이 비어있는 경우 기본값 반환
      }

      // 기본 성공 응답
      return { success: true };
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  };

  // 회원 로그인
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

      // 응답이 성공적인지 확인
      if (!response.ok) {
        // 409 상태 코드는 비밀번호 오류 또는 사용자가 없는 경우
        if (response.status === 409) {
          throw new Error('로그인 정보가 올바르지 않습니다.');
        }

        // 그 외 실패 상태 코드
        throw new Error(`로그인 실패: ${response.status}`);
      }

      // 성공적인 응답 처리
      let userData;

      try {
        const text = await response.text();
        if (text && text.trim()) {
          userData = JSON.parse(text);
        }
      } catch {
        // 응답 파싱에 실패하거나 응답이 비어있는 경우
        userData = { username };
      }

      // 응답 데이터가 없거나 username이 없는 경우 기본값 사용
      if (!userData || !userData.username) {
        userData = { username };
      }

      // 쿠키 설정 및 닉네임 상태 업데이트
      setCookie('userNickname', userData.username, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      setNickname(userData.username);

      return userData;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  };

  // 로그아웃
  const logout = () => {
    deleteCookie('userNickname', { path: '/' });
    setNickname('');
  };

  return { guestLogin, signUp, userLogin, logout };
}
