import { Client, StompSubscription } from '@stomp/stompjs';

export interface Chatting {
  sender: string;
  messageType: string;
  message: string;
}

export type Mode = 'FULL' | 'ONE_SEC';

export interface WebSocketState {
  client: Client | null;
  subscriptions: Record<string, StompSubscription | null>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  updateSubscription: (subscriptionType: string, roomId?: string) => void;
  sendMessage: (destination: string, payload?: unknown) => void;
  isConnected: boolean;
}
