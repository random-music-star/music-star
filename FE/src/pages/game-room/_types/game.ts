// pages/game-room/_types/game.ts

export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isReady?: boolean;
  role: 'host' | 'player'; // 역할 추가: 방장 또는 플레이어
}

export interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  roomCode?: string;
  maxPlayers: number;
  currentPlayers: number;
  gameYears: string[]; // 단일 값이 아닌 배열로 변경
  gameModes: string[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}
