import { create } from 'zustand';
import { Client, StompSubscription } from '@stomp/stompjs';
import { WebSocketState } from '@/types/websocket';
import { useGameChatStore } from './useGameChatStore';
import { usePublicChatStore } from './usePublicChatStore';
import { useGameScreenStore } from './useGameScreenStore';
import { useGameInfoStore } from './useGameRoomInfoStore';
import { useParticipantInfoStore } from './useGameParticipantStore';

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

    // 상태 초기화
    useGameChatStore.getState().resetGameChatStore();
    useGameScreenStore.getState().resetGameScreenStore();
    usePublicChatStore.getState().resetPublicChatStore();

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
      newSubscriptions['game-room'] = client.subscribe(
        `/topic/channel/1/room/1`,
        message => {
          const { type, response } = JSON.parse(message.body);

          if (type === 'timer') {
            console.log('timer');
          }
          if (type === 'gameStart') {
            console.log('게임 시작');
          }
          if (type === 'gameMode') {
            console.log('gameMode');
          }
          if (type === 'quiz') {
            console.log('quiz');
          }

          if (type === 'gameChat') {
            console.log('gameChat');
          }

          if (type === 'boardInfo') {
            console.log('boardInfo');
          }

          if (type === ' score') {
            console.log('score');
          }

          if (type === 'score') {
            console.log('score');
          }

          if (type === 'skip') {
            console.log('skip');
          }

          if (type === 'gameResult') {
            console.log('gameResult');
          }
          if (type === 'hint') {
            console.log('hint');
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
