import { toast } from 'sonner';

import { ApiContext, api } from './core';

export interface Channel {
  channelId: number;
  name: string;
  playerCount: number;
  maxPlayers: number;
}

interface GetChannelResponse {
  channels: Channel[];
}

export const getChannelsAPI = async (ctx?: ApiContext) => {
  const { data, success } = await api<GetChannelResponse>('/channel', {}, ctx);
  if (!success) {
    toast.error('채널 목록을 불러오는데 실패했습니다.');
  }
  return data?.channels;
};
