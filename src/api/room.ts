import { RoomApiRequestData } from '@/components/room/utils/roomDataConverter';
import { Mode } from '@/types/websocket';

import { ApiContext, api } from './core';

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

export const createRoomAPI = (roomForm: RoomApiRequestData, ctx?: ApiContext) =>
  api<{ roomId: string }>(
    '/room',
    {
      method: 'POST',
      body: JSON.stringify(roomForm),
    },
    ctx,
  );

export const getRoomsAPI = (
  channelId: string,
  page: number,
  ctx?: ApiContext,
) =>
  api<{ content: Room[]; number: number; totalPages: number }>(
    `/room?channelId=${channelId}&page=${page}&size=6`,
    { method: 'GET' },
    ctx,
  );

export const patchRoomAPI = (roomForm: RoomApiRequestData, ctx?: ApiContext) =>
  api<{ roomId: string }>(
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
  api<{ roomId: string; success: boolean }>(
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
  api<{ content: Room[]; number: number; totalPages: number }>(
    `/room/search/title?title=${title}&channelId=${channelId}`,
    {
      method: 'GET',
    },
    ctx,
  );

export const searchRoomByRoomNumberAPI = (
  roomNumber: number,
  channelId: string,
  ctx?: ApiContext,
) =>
  api<{ content: Room[]; number: number; totalPages: number }>(
    `/room/search/number?roomNumber=${roomNumber}&channelId=${channelId}`,
    { method: 'GET' },
    ctx,
  );
