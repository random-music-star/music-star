import { Client, StompSubscription } from '@stomp/stompjs';

export interface Chatting {
  sender: string;
  messageType: string;
  message: string;
}

export type Mode = 'FULL' | 'DUAL' | 'TTS';

export interface WebSocketState {
  client: Client | null;
  subscriptions: Record<string, StompSubscription | null>;
  connectWebSocket: (nickname: string) => void;
  disconnectWebSocket: () => void;
  checkSubscription: (subscriptiontype: string) => boolean;
  updateSubscription: (
    subscriptionType: string,
    channelId: string,
    roomId?: string,
  ) => void;
  sendMessage: (destination: string, payload?: unknown) => void;
  isConnected: boolean;
}
