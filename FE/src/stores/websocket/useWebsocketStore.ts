import { create } from 'zustand';
import { Client, StompSubscription } from '@stomp/stompjs';
import { Board, WebSocketState } from '@/types/websocket';
import { useGameChatStore } from './useGameChatStore';
import { usePublicChatStore } from './usePublicChatStore';
import { useGameScreenStore } from './useGameScreenStore';
import { useGameInfoStore } from './useGameRoomInfoStore';
import { useParticipantInfoStore } from './useGameParticipantStore';
import { useGameStateStore } from './useGameStateStore';
import { useGameScoreStore } from './useGameScoreStore';

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
    useGameScreenStore.getState().resetGameScreenStore();
    usePublicChatStore.getState().resetPublicChatStore();

    const newSubscriptions: Record<string, StompSubscription> = {};

    if (subscriptionType === 'channel') {
      newSubscriptions['channel'] = client.subscribe(
        `/topic/channel/1`,
        message => {
          const { response } = JSON.parse(message.body);
          usePublicChatStore.getState().setPublicChattings(response);
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
        `/topic/channel/1/room/1`,
        message => {
          const { type, response } = JSON.parse(message.body);

          if (type === 'timer') {
            gameScreenStore.setRemainTime(response.remainTime);
          }

          if (type === 'gameMode') {
            gameScreenStore.setGameMode(response);
            gameStateStore.setGameState('gameWait');

            gameScoreStore.setScores(
              participantInfoStore.participantInfo.reduce<Board>((acc, p) => {
                acc[p.userName] = 0;
                return acc;
              }, {}),
            );
          }
          if (type === 'quizInfo') {
            gameScreenStore.setSongUrl(response.songUrl);
            gameStateStore.setGameState('gameQuizOpened');
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
              message: `현재 ${response.skipCount}명이 스킵했습니다. `,
            });
          }

          if (type === 'next') {
            // 메세지 추가
            if (gameScreenStore.gameResult) {
              gameStateStore.setGameState('gameScoreUpdate');

              gameScoreStore.updateScores(
                gameScreenStore.gameResult.winner,
                gameScreenStore.gameResult.score,
              );
            }
          }

          if (type === 'gameResult') {
            gameScreenStore.setGameResult(response);
            gameStateStore.setGameState('gameResultOpened');
          }
          if (type === 'hint') {
            gameScreenStore.setGameHint(response);
          }
          if (type === 'roomInfo') {
            useGameInfoStore.getState().setGameInfo(response);
          }
          if (type === 'userInfo') {
            useParticipantInfoStore
              .getState()
              .setParticipantInfo(response?.userInfoList);
          }
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
