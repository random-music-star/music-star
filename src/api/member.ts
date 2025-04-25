import { type ApiContext, api } from './core';

interface LoginForm {
  username: string;
  password: string;
}

interface Member {
  username: string;
  memberType: string;
  inLobby: boolean;
  roomStatus: null | 'WAITING' | 'IN_PROGRESS' | 'END';
}

export const userNicknameAPI = (ctx?: ApiContext) =>
  api<{ nickname: string }>('/member/nickname', { method: 'GET' }, ctx);

export const guestLoginAPI = (ctx?: ApiContext) =>
  api<{ token: string }>('/member/guest/login', { method: 'GET' }, ctx);

export const userLoginAPI = (loginForm: LoginForm, ctx?: ApiContext) =>
  api<{ token: string }>(
    '/member/user/login',
    { method: 'POST', body: JSON.stringify(loginForm) },
    ctx,
  );

export const userSignupAPI = (loginForm: LoginForm, ctx?: ApiContext) =>
  api<{ token: string }>(
    '/member/user/signup',
    { method: 'POST', body: JSON.stringify(loginForm) },
    ctx,
  );

// 채널 내 유저 목록 조회
export const getChannelUsersAPI = (channelId: string, ctx?: ApiContext) =>
  api<{ users: Member[] }>(
    `/member/${channelId}`,
    {
      method: 'GET',
    },
    ctx,
  );
