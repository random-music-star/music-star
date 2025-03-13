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
  setRemainTime: (remainTime: number | null) => void;
  gameMode: GameMode | null;
  setGameMode: (gameMode: GameMode | null) => void;
  songUrl: string | null;
  setSongUrl: (songUrl: string | null) => void;
  boardInfo: BoardUser[];
  setBoardInfo: (boardInfo: BoardUser[] | []) => void;
  score: BoardUser[];
  setScore: (score: BoardUser[] | []) => void;
  gameResult: GameResult | null;
  setGameResult: (gameResult: GameResult | null) => void;
  gameHint: GameHint | null;
  setGameHint: (gameHint: GameHint | null) => void;
  resetGameScreenStore: () => void;
}

export interface PublicChatState {
  publicChattings: Chatting[];
  setPublicChattings: (publicChatting?: Chatting) => void;
  resetPublicChatStore: () => void;
}
