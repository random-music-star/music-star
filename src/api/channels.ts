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
  const { channels } = await api<GetChannelResponse>('/channel', {}, ctx);
  return channels;
};
