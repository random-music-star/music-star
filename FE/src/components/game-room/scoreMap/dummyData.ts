// dummyData.ts
import { ParticipantInfo } from '@/stores/websocket/useGameParticipantStore';

// 캐릭터 이미지 경로 (더미 데이터용)
const characterImages = [
  '/character/character_1.svg',
  '/character/character_2.svg',
  '/character/character_3.svg',
  '/character/character_4.svg',
  '/character/character_5.svg',
  '/character/character_6.svg',
  '/character/character_7.svg',
  '/character/character_8.svg',
];

// 더미 참가자 정보 (테스트용)
export const dummyParticipants: ParticipantInfo[] = [
  {
    userName: '슈퍼플레이어',
    isReady: true,
    isHost: true,
    character: characterImages[0],
  },
  {
    userName: '게임마스터',
    isReady: true,
    isHost: false,
    character: characterImages[1],
  },
  {
    userName: '퀴즈왕',
    isReady: true,
    isHost: false,
    character: characterImages[2],
  },
  {
    userName: '천재소년',
    isReady: true,
    isHost: false,
    character: characterImages[3],
  },
  {
    userName: '문제풀이왕',
    isReady: true,
    isHost: false,
    character: characterImages[4],
  },
  {
    userName: '도전자123',
    isReady: true,
    isHost: false,
    character: characterImages[5],
  },
  {
    userName: '상식퀴즈챔프',
    isReady: true,
    isHost: false,
    character: characterImages[6],
  },
  {
    userName: '불꽃남자',
    isReady: true,
    isHost: false,
    character: characterImages[7],
  },
  {
    userName: '퀴즈여신',
    isReady: true,
    isHost: false,
    character: characterImages[0],
  },
  {
    userName: '문제맞추기',
    isReady: true,
    isHost: false,
    character: characterImages[1],
  },
  {
    userName: '지식의바다',
    isReady: true,
    isHost: false,
    character: characterImages[2],
  },
  {
    userName: '두뇌풀가동',
    isReady: true,
    isHost: false,
    character: characterImages[3],
  },
  {
    userName: '퍼즐마스터',
    isReady: true,
    isHost: false,
    character: characterImages[4],
  },
  {
    userName: '산소같은존재',
    isReady: true,
    isHost: false,
    character: characterImages[5],
  },
  {
    userName: '우주최강',
    isReady: true,
    isHost: false,
    character: characterImages[6],
  },
  {
    userName: '퀴즈의신',
    isReady: true,
    isHost: false,
    character: characterImages[7],
  },
  {
    userName: '배틀챔피언',
    isReady: true,
    isHost: false,
    character: characterImages[0],
  },
  {
    userName: '지식Hunter',
    isReady: true,
    isHost: false,
    character: characterImages[1],
  },
  {
    userName: '문제요정',
    isReady: true,
    isHost: false,
    character: characterImages[2],
  },
  {
    userName: '게임중독자',
    isReady: true,
    isHost: false,
    character: characterImages[3],
  },
  {
    userName: '상식의왕자',
    isReady: true,
    isHost: false,
    character: characterImages[4],
  },
  {
    userName: '정답의여왕',
    isReady: true,
    isHost: false,
    character: characterImages[5],
  },
  {
    userName: '현대마법사',
    isReady: true,
    isHost: false,
    character: characterImages[6],
  },
  {
    userName: '키보드워리어',
    isReady: true,
    isHost: false,
    character: characterImages[7],
  },
];

// 더미 점수 데이터 (테스트용)
export const dummyScores: Record<string, number> = {
  슈퍼플레이어: 9800,
  게임마스터: 9500,
  퀴즈왕: 9100,
  천재소년: 8700,
  문제풀이왕: 8300,
  도전자123: 7900,
  상식퀴즈챔프: 7600,
  불꽃남자: 7200,
  퀴즈여신: 6800,
  문제맞추기: 6500,
  지식의바다: 6200,
  두뇌풀가동: 5800,
  퍼즐마스터: 5400,
  산소같은존재: 5000,
  우주최강: 4600,
  퀴즈의신: 4200,
  배틀챔피언: 3800,
  지식Hunter: 3400,
  문제요정: 3000,
  게임중독자: 2600,
  상식의왕자: 2200,
  정답의여왕: 1800,
  현대마법사: 1400,
  키보드워리어: 1000,
};

// 현재 사용자 정보 (실제로는 store에서 가져올 예정)
export const currentUser = '도전자123';
