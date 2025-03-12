import { Client, StompSubscription } from '@stomp/stompjs';

export interface Chatting {
  sender: string;
  messageType: string;
  message: string;
}

export interface BoardInfo {
  sender: string;
  messageType: string;
  message: string;
}

export type BoardUser = {
  [key: string]: number;
};

export type SkipUser = {
  [key: string]: boolean;
};

export interface GameResult {
  winner: string;
  songTitle: string;
  singer: string;
}

export interface GameHint {
  title: string;
  singer: string | null;
}

export interface GameMode {
  mode: string;
  round: number;
}
export interface WebSocketState {
  client: Client | null;
  subscriptions: Record<string, StompSubscription | null>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  updateSubscription: (subscriptionType: string) => void;
  sendMessage: (destination: string, payload?: unknown) => void;
  remainTime: number | null;
  gameMode: GameMode | null;
  songUrl: string | null;
  gameChattings: Chatting[] | [];
  publicChattings: Chatting[] | [];
  boardInfo: BoardUser[] | null;
  skipInfo: SkipUser[] | null;
  gameResult: GameResult | null;
  gameHint: GameHint | null;
  isConnected: boolean;
}
