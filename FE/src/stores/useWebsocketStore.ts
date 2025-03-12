import { create } from 'zustand';
import { Client, StompSubscription } from '@stomp/stompjs';
import { WebSocketState } from '@/types/websocket';

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  remainTime: null,
  mode: null,
  songUrl: null,
  gameChattings: null,
  boardInfo: null,
  skipInfo: null,
  gameResult: null,
  gameHint: null,

  client: null,
  subscriptions: {},
  connectWebSocket: () => {
    if (get().client) return;

    const client = new Client({
      webSocketFactory: () => new WebSocket(`${process.env.WEBSOCKET_URL}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.activate();
    set({ client });
  },

  disconnectWebSocket: () => {
    const { client, subscriptions } = get();

    Object.values(subscriptions).forEach(sub => sub?.unsubscribe());

    set({
      // 상태 초기화
    });

    if (client) {
      client.deactivate();
      set({ client: null, subscriptions: {} });
    }
  },

  updateSubscription: (subscriptionType: string) => {
    const { client, subscriptions } = get();
    if (!client || !client.connected) return;

    Object.values(subscriptions).forEach(sub => sub?.unsubscribe());

    set({
      // 상태 초기화
    });

    const newSubscriptions: Record<string, StompSubscription> = {};

    if (subscriptionType === 'status') {
      newSubscriptions['status'] = client.subscribe(
        `/topic/game/status`,
        message => {
          const data = JSON.parse(message.body);
          console.log(data);
          // 상태 업데이트
        },
      );
    }

    if (subscriptionType === 'game') {
      newSubscriptions['room'] = client.subscribe(`/topic/game`, message => {
        const data = JSON.parse(message.body);
        console.log(data);
        // 상태 업데이트
      });
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
