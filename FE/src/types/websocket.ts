import { Client, StompSubscription } from '@stomp/stompjs';

export interface Chatting {
  sender: string;
  messageType: string;
  message: string;
}

export interface BoardInfo {
  sender: string;
  messageType: string;
  message: 'default' | 'notice' | 'error';
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
  isConnected: boolean;
}

export interface GameChatState {
  gameChattings: Chatting[];
  setGameChattings: (gameChatting: Chatting) => void;
  skipInfo: SkipUser[];
  setSkipInfo: (skipUser: SkipUser) => void;
  resetGameChatStore: () => void;
}

export interface GameScreenState {
  remainTime: number | null;
  gameMode: GameMode | null;
  songUrl: string | null;
  boardInfo: BoardUser[];
  score: BoardUser[];
  gameResult: GameResult | null;
  gameHint: GameHint | null;
  resetGameScreenStore: () => void;
}

export interface PublicChatState {
  publicChattings: Chatting[];
  setPublicChattings: (publicChatting?: Chatting) => void;
  resetPublicChatStore: () => void;
}
