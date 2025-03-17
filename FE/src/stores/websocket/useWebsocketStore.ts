import { Client, StompSubscription } from '@stomp/stompjs';
import { create } from 'zustand';

import { Board, WebSocketState } from '@/types/websocket';

import { useGameChatStore } from './useGameChatStore';
import { useParticipantInfoStore } from './useGameParticipantStore';
import { useGameInfoStore } from './useGameRoomInfoStore';
import { useGameScoreStore } from './useGameScoreStore';
import { useGameScreenStore } from './useGameScreenStore';
import { useGameStateStore } from './useGameStateStore';
import { useNicknameStore } from '../auth/useNicknameStore';
import { usePublicChatStore } from './usePublicChatStore';

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,

  client: null,
  subscriptions: {},
  connectWebSocket: () => {
    if (get().client) return;

    const client = new Client({
      webSocketFactory: () =>
        new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        set({ isConnected: true });
      },
    });

    client.activate();
    set({ client });
  },

  disconnectWebSocket: () => {
    const { client, subscriptions } = get();

    Object.values(subscriptions).forEach(sub => sub?.unsubscribe());

    if (client) {
      client.deactivate();
      set({ client: null, subscriptions: {}, isConnected: false });
    }
  },

  updateSubscription: (subscriptionType: string) => {
    const { client, subscriptions } = get();

    if (!client || !client.connected) return;

    Object.values(subscriptions).forEach(sub => sub?.unsubscribe());

    useGameChatStore.getState().resetGameChatStore();
    useParticipantInfoStore.getState().resetParticipantInfo();
    useGameInfoStore.getState().resetGameRoomInfo();
    useGameScreenStore.getState().resetGameScreenStore();
    useGameStateStore.getState().resetGameState();
    usePublicChatStore.getState().resetPublicChatStore();

    const newSubscriptions: Record<string, StompSubscription> = {};

    if (subscriptionType === 'channel') {
      newSubscriptions['channel'] = client.subscribe(
        `/topic/channel/1`,
        message => {
          const { response } = JSON.parse(message.body);
          usePublicChatStore.getState().setPublicChattings(response);
        },
        {
          Authorization: useNicknameStore.getState().nickname,
        },
      );
    }

    if (subscriptionType === 'game-room') {
      const gameScreenStore = useGameScreenStore.getState();
      const gameChatStore = useGameChatStore.getState();
      const gameStateStore = useGameStateStore.getState();
      const gameScoreStore = useGameScoreStore.getState();
      const participantInfoStore = useParticipantInfoStore.getState();

      newSubscriptions['game-room'] = client.subscribe(
        `/topic/channel/1/room/11`,
        message => {
          const { type, response } = JSON.parse(message.body);

          if (type === 'timer') {
            gameScreenStore.setRemainTime(response.remainTime);
          }

          if (type === 'roundInfo') {
            gameChatStore.setGameChattings({
              sender: 'system',
              messageType: 'notice',
              message: `곧 다음 라운드가 시작됩니다. `,
            });

            gameScreenStore.setGameMode(response);
            gameStateStore.setGameState('TIMER_WAIT');
            gameScreenStore.setGameHint(null);

            gameScoreStore.setScores(
              participantInfoStore.participantInfo.reduce<Board>((acc, p) => {
                acc[p.userName] = 0;
                return acc;
              }, {}),
            );
          }
          if (type === 'quizInfo') {
            gameScreenStore.setSongUrl(response.songUrl);
            gameStateStore.setGameState('QUIZ_OPEN');
          }

          if (type === 'gameChat') {
            gameChatStore.setGameChattings(response);
          }

          if (type === 'boardInfo') {
            gameScreenStore.setBoardInfo(response.board);
          }

          if (type === ' score') {
            gameScreenStore.setScore(response.board);
          }

          if (type === 'skip') {
            gameChatStore.setGameChattings({
              sender: 'system',
              messageType: 'notice',
              message: `현재 ${response.skipPerson}명이 스킵했습니다. `,
            });
          }

          if (type === 'next') {
            // 메세지 추가
            if (gameScreenStore.gameResult) {
              gameStateStore.setGameState('SCORE_UPDATE');

              gameScoreStore.updateScores(
                gameScreenStore.gameResult.winner,
                gameScreenStore.gameResult.score,
              );
            }
          }

          if (type === 'gameResult') {
            gameScreenStore.setGameResult(response);
            gameStateStore.setGameState('GAME_RESULT');
          }

          if (type === 'hint') {
            gameScreenStore.setGameHint(response);
          }

          if (type === 'roomInfo') {
            useGameInfoStore.getState().setGameInfo(response);

            if (response.status === 'IN_PROGRESS')
              gameStateStore.setGameState('TIMER_WAIT');
          }

          if (type === 'userInfo') {
            participantInfoStore.setParticipantInfo(response.userInfoList);

            participantInfoStore.updateParticipantReadyStates(
              response.userInfoList,
            );

            participantInfoStore.setIsAllReady(response.allReady);
          }

          if (type === 'refuseEnter') {
            console.log('refuseEnter');
          }
        },
        {
          Authorization: useNicknameStore.getState().nickname,
        },
      );
    }

    set({ subscriptions: newSubscriptions });
  },

  sendMessage: (destination, payload) => {
    const { client } = get();

    if (!client || !client.connected) {
      return;
    }

    client.publish({ destination, body: JSON.stringify(payload) });
  },
}));
