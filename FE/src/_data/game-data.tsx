// pages/game-room/_data/game-data.ts
import { ChatMessage, Room, User } from '../_types/game';

// 사용자 데이터
export const userData: User[] = [
  {
    id: 'user1',
    name: '게임마스터',
    avatar: '/api/placeholder/40/40',
    level: 42,
    isReady: true,
    role: 'host', // 방장
  },
  {
    id: 'user2',
    name: '플레이어2',
    avatar: '/api/placeholder/40/40',
    level: 15,
    isReady: true,
    role: 'player',
  },
  {
    id: 'user3',
    name: '플레이어3',
    avatar: '/api/placeholder/40/40',
    level: 21,
    isReady: true,
    role: 'player',
  },
  {
    id: 'user4',
    name: '플레이어4',
    avatar: '/api/placeholder/40/40',
    level: 7,
    isReady: true,
    role: 'player',
  },
  {
    id: 'user5',
    name: '플레이어5',
    avatar: '/api/placeholder/40/40',
    level: 30,
    isReady: true,
    role: 'player',
  },
  {
    id: 'user6',
    name: '플레이어6',
    avatar: '/api/placeholder/40/40',
    level: 18,
    isReady: true,
    role: 'player',
  },
  {
    id: 'user7',
    name: '플레이어7',
    avatar: '/api/placeholder/40/40',
    level: 11,
    isReady: true,
    role: 'player',
  },
  {
    id: 'user8',
    name: '플레이어8',
    avatar: '/api/placeholder/40/40',
    level: 5,
    isReady: true,
    role: 'player',
  },
];

// 방 데이터
export const roomData: Room = {
  id: 'room1',
  name: '즐거운 음악 게임방',
  isPrivate: true,
  roomCode: 'ABC123',
  maxPlayers: 10,
  currentPlayers: 8,
  gameYears: ['20년', '21년', '22년'],
  gameModes: ['한곡', 'AI생성', '2배속'],
};

// 채팅 메시지
export const chatMessages: ChatMessage[] = [
  {
    id: 'msg1',
    userId: 'system',
    userName: '시스템',
    text: '게임 대기실에 오신 것을 환영합니다!',
    timestamp: '12:00',
    isSystem: true,
  },
  {
    id: 'msg2',
    userId: 'user1',
    userName: '게임마스터',
    text: '안녕하세요! 모두 준비되셨나요?',
    timestamp: '12:01',
  },
  {
    id: 'msg3',
    userId: 'user2',
    userName: '플레이어2',
    text: '네! 시작해요!',
    timestamp: '12:02',
  },
  {
    id: 'msg4',
    userId: 'user3',
    userName: '플레이어3',
    text: '잠시만요, 마이크 설정 중입니다',
    timestamp: '12:03',
  },
  {
    id: 'msg5',
    userId: 'system',
    userName: '시스템',
    text: '플레이어4님이 방에 입장했습니다',
    timestamp: '12:04',
    isSystem: true,
  },
  {
    id: 'msg6',
    userId: 'user4',
    userName: '플레이어4',
    text: '안녕하세요!',
    timestamp: '12:05',
  },
  {
    id: 'msg7',
    userId: 'user5',
    userName: '플레이어5',
    text: '게임 모드 중에 AI생성이 뭐예요?',
    timestamp: '12:06',
  },
  {
    id: 'msg8',
    userId: 'user1',
    userName: '게임마스터',
    text: 'AI가 만든 노래도 맞추는 모드입니다!',
    timestamp: '12:07',
  },
  {
    id: 'msg9',
    userId: 'user6',
    userName: '플레이어6',
    text: '오 재밌겠네요',
    timestamp: '12:08',
  },
  {
    id: 'msg10',
    userId: 'user7',
    userName: '플레이어7',
    text: '저는 준비 완료했습니다!',
    timestamp: '12:09',
  },
  {
    id: 'msg11',
    userId: 'user8',
    userName: '플레이어8',
    text: '저도 곧 준비할게요~ 잠시만요',
    timestamp: '12:10',
  },
];
