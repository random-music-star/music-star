import api from '../instance';

export interface Channel {
  channelId: number;
  name: string;
  playerCount: number;
  maxPlayers: number;
}
interface GetChannelResponse {
  channels: Channel[];
}

export const getChannelsApi = async (): Promise<GetChannelResponse> => {
  const { data } = await api.get<GetChannelResponse>(`/channel`);
  return data;
};
