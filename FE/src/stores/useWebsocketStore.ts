import { create } from 'zustand';
import { Client, StompSubscription } from '@stomp/stompjs';
import { WebSocketState } from '@/types/websocket';

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  remainTime: null,
  mode: null,
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
      webSocketFactory: () => new WebSocket(`ws://localhost:8080/ws`),
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
    });

    const newSubscriptions: Record<string, StompSubscription> = {};

    if (subscriptionType === 'channel') {
      newSubscriptions['channel'] = client.subscribe(
        `/topic/channel/1`,
        message => {
          const { _type, response } = JSON.parse(message.body);

          set({
            publicChattings: [...get().publicChattings, response],
          });
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
