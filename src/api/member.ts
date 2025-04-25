import { type ApiContext, api } from './core';

export interface Member {
  username: string;
  memberType: 'GUEST' | 'USER';
  inLobby: boolean;
  roomStatus: 'WAITING' | 'IN_PROGRESS' | null;
}

export const userNicknameAPI = (ctx?: ApiContext) =>
  api<{ username: string }>('/auth/me', { method: 'GET' }, ctx);

export const getChannelUsersAPI = (channelId: string, ctx?: ApiContext) =>
  api<{ users: Member[] }>(
    `/member/${channelId}`,
    {
      method: 'GET',
    },
    ctx,
  );
