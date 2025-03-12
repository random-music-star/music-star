import { create } from 'zustand';
import { Client, StompSubscription } from '@stomp/stompjs';
import { WebSocketState } from '@/types/websocket';

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  remainTime: null,
  gameMode: null,
  songUrl: null,
  gameChattings: [],
  publicChattings: [],
  boardInfo: null,
  skipInfo: null,
  gameResult: null,
  gameHint: null,
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

    set({
      // 상태 초기화
      remainTime: null,
      gameMode: null,
      songUrl: null,
      gameChattings: [],
      publicChattings: [],
      boardInfo: null,
      skipInfo: null,
      gameResult: null,
      gameHint: null,
    });

    if (client) {
      client.deactivate();
      set({ client: null, subscriptions: {}, isConnected: false });
    }
  },

  updateSubscription: (subscriptionType: string) => {
    const { client, subscriptions } = get();

    if (!client || !client.connected) return;

    Object.values(subscriptions).forEach(sub => sub?.unsubscribe());

    set({
      // 상태 초기화
      remainTime: null,
      gameMode: null,
      songUrl: null,
      gameChattings: [],
      publicChattings: [],
      boardInfo: null,
      skipInfo: null,
      gameResult: null,
      gameHint: null,
    });

    const newSubscriptions: Record<string, StompSubscription> = {};

    if (subscriptionType === 'channel') {
      newSubscriptions['channel'] = client.subscribe(
        `/topic/channel/1`,
        message => {
          const { response } = JSON.parse(message.body);

          set({
            publicChattings: [...get().publicChattings, response],
          });
        },
      );
    }

    if (subscriptionType === 'game-room') {
      newSubscriptions['game-room'] = client.subscribe(
        `/topic/channel/1/room/1`,
        message => {
          const { type, response } = JSON.parse(message.body);

          if (type === 'timer') {
            set({
              remainTime: response.remainTime,
            });
          }
          if (type === 'gameStart') {
            console.log('게임 시작');
          }
          if (type === 'gameMode') {
            set({
              gameMode: response,
            });
          }
          if (type === 'quiz') {
            set({
              songUrl: response.songUrl,
            });
          }

          if (type === 'gameChat') {
            set({
              gameChattings: [...get().gameChattings, response],
            });
          }

          if (type === 'boardInfo') {
            console.log('boardInfo');
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
