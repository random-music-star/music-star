import { Mode } from '@/types/websocket';

import { ApiContext, api } from './core';

interface RoomForm {
  channelId: number;
  title: string;
  password: string;
  format: string;
  gameModes: string[];
  selectedYears: number[];
}

interface Room {
  id: string;
  title: string;
  hostName: string;
  format: 'GENERAL' | 'BOARD';
  maxPlayer: number;
  currentPlayers: number;
  maxGameRound: number;
  playTime: number;
  status: 'WAITING' | 'PLAYING' | 'END';
  roomNumber: number;
  channelId: number;
  hasPassword: boolean;
  gameModes: Mode[];
  years: number[];
}

export const createRoomAPI = (roomForm: RoomForm, ctx?: ApiContext) =>
  api<{ roomId: string }>(
    '/room',
    {
      method: 'POST',
      body: JSON.stringify(roomForm),
    },
    ctx,
  );

export const getRoomsAPI = (
  channelId: number,
  page: number,
  ctx?: ApiContext,
) =>
  api<{ content: Room[] }>(
    `/room?channelId=${channelId}&page=${page}&size=6`,
    { method: 'GET' },
    ctx,
  );

export const patchRoomAPI = (roomForm: RoomForm, ctx?: ApiContext) =>
  api(
    '/room',
    {
      method: 'PATCH',
      body: JSON.stringify(roomForm),
    },
    ctx,
  );

export const enterRoomAPI = (
  roomId: string,
  password: string,
  ctx?: ApiContext,
) =>
  api<{ roomId: string }>(
    `/room/enter`,
    {
      method: 'POST',
      body: JSON.stringify({
        roomId,
        password,
      }),
    },
    ctx,
  );

// 제목으로 검색
export const searchRoomByTitleAPI = (
  title: string,
  channelId: string,
  ctx?: ApiContext,
) =>
  api<{ content: Room[] }>(
    `/room/search/title?title=${title}&channelId=${channelId}`,
    {
      method: 'GET',
    },
    ctx,
  );

// 방 번호로 검색
export const searchRoomByRoomNumberAPI = (
  roomNumber: number,
  channelId: string,
  ctx?: ApiContext,
) =>
  api<{ content: Room[] }>(
    `/room/search/number?roomNumber=${roomNumber}&channelId=${channelId}`,
    { method: 'GET' },
    ctx,
  );
