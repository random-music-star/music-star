import { create } from 'zustand';
import { Client, StompSubscription } from '@stomp/stompjs';
import { WebSocketState } from '@/types/websocket';

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  remainTime: null,
  gameMode: null,
  songUrl: null,
  gameChattings: [],
  publicChattings: [
    { sender: '달송이', messageType: 'CHAT', message: '안녕하세요! 반가워요~' },
    { sender: '퐁퐁이', messageType: 'CHAT', message: '오늘 방 만들 사람?' },
    { sender: '알송이', messageType: 'CHAT', message: '저요! 같이 게임해요' },
    {
      sender: '운영자',
      messageType: 'NOTICE',
      message: '게임 서버가 점검 중입니다. 잠시만 기다려주세요.',
    },
    { sender: '구름이', messageType: 'CHAT', message: '언제 끝나나요?' },
    { sender: '별님이', messageType: 'CHAT', message: '30분 정도 걸린대요' },
    {
      sender: '알송이',
      messageType: 'CHAT',
      message: '그럼 조금 있다 다시 올게요!',
    },
    { sender: '달송이', messageType: 'CHAT', message: '네~ 다음에 봐요~' },
  ],
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
      remainTime: null,
      gameMode: null,
      songUrl: null,
      gameChattings: [],
      publicChattings: [
        {
          sender: '달송이',
          messageType: 'CHAT',
          message: '안녕하세요! 반가워요~',
        },
        {
          sender: '퐁퐁이',
          messageType: 'CHAT',
          message: '오늘 방 만들 사람?',
        },
        {
          sender: '알송이',
          messageType: 'CHAT',
          message: '저요! 같이 게임해요',
        },
        {
          sender: '운영자',
          messageType: 'NOTICE',
          message: '게임 서버가 점검 중입니다. 잠시만 기다려주세요.',
        },
        { sender: '구름이', messageType: 'CHAT', message: '언제 끝나나요?' },
        {
          sender: '별님이',
          messageType: 'CHAT',
          message: '30분 정도 걸린대요',
        },
        {
          sender: '알송이',
          messageType: 'CHAT',
          message: '그럼 조금 있다 다시 올게요!',
        },
        { sender: '달송이', messageType: 'CHAT', message: '네~ 다음에 봐요~' },
      ],
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
      remainTime: null,
      gameMode: null,
      songUrl: null,
      gameChattings: [],
      publicChattings: [
        {
          sender: '달송이',
          messageType: 'CHAT',
          message: '안녕하세요! 반가워요~',
        },
        {
          sender: '퐁퐁이',
          messageType: 'CHAT',
          message: '오늘 방 만들 사람?',
        },
        {
          sender: '알송이',
          messageType: 'CHAT',
          message: '저요! 같이 게임해요',
        },
        {
          sender: '운영자',
          messageType: 'NOTICE',
          message: '게임 서버가 점검 중입니다. 잠시만 기다려주세요.',
        },
        { sender: '구름이', messageType: 'CHAT', message: '언제 끝나나요?' },
        {
          sender: '별님이',
          messageType: 'CHAT',
          message: '30분 정도 걸린대요',
        },
        {
          sender: '알송이',
          messageType: 'CHAT',
          message: '그럼 조금 있다 다시 올게요!',
        },
        { sender: '달송이', messageType: 'CHAT', message: '네~ 다음에 봐요~' },
      ],
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
