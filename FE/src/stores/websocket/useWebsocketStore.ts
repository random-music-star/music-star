import { Client, StompSubscription } from '@stomp/stompjs';
import { create } from 'zustand';

import { WebSocketState } from '@/types/websocket';

import { useNicknameStore } from '../auth/useNicknameStore';
import { useGameBoardInfoStore } from './useGameBoardInfoStore';
import { useGameChatStore } from './useGameChatStore';
import { useParticipantInfoStore } from './useGameParticipantStore';
import { useGameInfoStore } from './useGameRoomInfoStore';
import { useGameRoundInfoStore } from './useGameRoundInfoStore';
import { useGameRoundResultStore } from './useGameRoundResultStore';
import { useGameScreenStore } from './useGameScreenStore';
import { useGameStateStore } from './useGameStateStore';
import { useGameWinnerStore } from './useGameWinnerStore';
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

  checkSubscription: (subscriptionType: string) => {
    const { subscriptions } = get();
    return !!subscriptions[subscriptionType];
  },

  updateSubscription: (subscriptionType: string, roomId?: string) => {
    const { client, subscriptions } = get();

    if (!client || !client.connected) return;

    Object.values(subscriptions).forEach(sub => sub?.unsubscribe());

    useGameChatStore.getState().resetGameChatStore();
    useGameScreenStore.getState().resetGameScreenStore();
    useGameStateStore.getState().resetGameState();
    usePublicChatStore.getState().resetPublicChatStore();
    useGameWinnerStore.getState().resetWinnerStore();

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
      const participantInfoStore = useParticipantInfoStore.getState();
      const gameRoomStore = useGameInfoStore.getState();
      const gameRoundResult = useGameRoundResultStore.getState();
      const roundInfo = useGameRoundInfoStore.getState();
      const boardInfoStore = useGameBoardInfoStore.getState();
      const winnerStore = useGameWinnerStore.getState();

      newSubscriptions['game-room'] = client.subscribe(
        `/topic/channel/1/room/${roomId}`,
        message => {
          const { type, response } = JSON.parse(message.body);

          if (type === 'timer') {
            gameScreenStore.setRemainTime(response.remainTime);

            if (response.remainTime === 1) {
              gameStateStore.setGameState('ROUND_OPEN');
            }
          }

          if (type === 'roundInfo') {
            gameChatStore.setGameChattings({
              sender: 'system',
              messageType: 'notice',
              message: `곧 다음 라운드가 시작됩니다. `,
            });

            roundInfo.setGameMode(response);
            gameStateStore.setGameState('TIMER_WAIT');
            gameScreenStore.setGameHint(null);
          }

          if (type === 'quizInfo') {
            gameScreenStore.setSongUrl(response.songUrl);
            gameStateStore.setGameState('QUIZ_OPEN');
          }

          if (type === 'gameChat') {
            gameChatStore.setGameChattings(response);
          }

          if (type === 'skip') {
            gameChatStore.setGameChattings({
              sender: 'system',
              messageType: 'notice',
              message: `현재 ${response.skipPerson}명이 스킵했습니다. `,
            });
          }

          if (type === 'next') {
            if (gameRoundResult.gameRoundResult) {
              gameStateStore.setGameState('SCORE_UPDATE');
            }
          }

          if (type === 'gameResult') {
            gameRoundResult.setGameRoundResult(response);
            gameStateStore.setGameState('GAME_RESULT');
          }

          if (type === 'hint') {
            gameScreenStore.setGameHint(response);
          }

          if (type === 'roomInfo') {
            gameRoomStore.setGameInfo(response);

            if (response.status === 'IN_PROGRESS') {
              gameStateStore.setGameState('TIMER_WAIT');

              const initialBoard = useParticipantInfoStore
                .getState()
                .participantInfo.reduce(
                  (acc, participant) => ({ ...acc, [participant.userName]: 0 }),
                  {} as Record<string, number>,
                );

              boardInfoStore.setBoardInfo(initialBoard);
            }
          }

          if (type === 'userInfo') {
            participantInfoStore.setParticipantInfo(response.userInfoList);

            participantInfoStore.updateParticipantReadyStates(
              response.userInfoList,
            );

            participantInfoStore.setIsAllReady(response.allReady);
          }

          if (type === 'move') {
            boardInfoStore.updateBoardInfo(response);
            gameStateStore.setGameState('SCORE_UPDATE');
          }

          if (type === 'refuseEnter') gameStateStore.setGameState('REFUSED');

          if (type === 'gameEnd') {
            gameStateStore.setGameState('GAME_END');
            winnerStore.setWinner(response.winner);
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
