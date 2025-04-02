import { Client, StompSubscription } from '@stomp/stompjs';
import { create } from 'zustand';

import { WebSocketState } from '@/types/websocket';

import { useNicknameStore } from '../auth/useNicknameStore';
import { useGameBubbleStore } from './useGameBubbleStore';
import { useGameChatStore } from './useGameChatStore';
import { useParticipantInfoStore } from './useGameParticipantStore';
import { useGameInfoStore } from './useGameRoomInfoStore';
import { useGameRoundInfoStore } from './useGameRoundInfoStore';
import { useGameRoundResultStore } from './useGameRoundResultStore';
import { useGameStateStore } from './useGameStateStore';
import { useGameWinnerStore } from './useGameWinnerStore';
import { usePublicChatStore } from './usePublicChatStore';
import { useRoundHintStore } from './useRoundHintStore';
import { useScoreStore } from './useScoreStore';

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
    useGameStateStore.getState().resetGameState();
    usePublicChatStore.getState().resetPublicChatStore();
    useGameWinnerStore.getState().resetWinnerStore();
    useParticipantInfoStore.getState().resetParticipantInfo();

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
      const gameChatStore = useGameChatStore.getState();
      const gameStateStore = useGameStateStore.getState();
      const participantInfoStore = useParticipantInfoStore.getState();
      const gameRoomStore = useGameInfoStore.getState();
      const gameRoundResult = useGameRoundResultStore.getState();
      const roundInfo = useGameRoundInfoStore.getState();
      const score = useScoreStore.getState();
      const winnerStore = useGameWinnerStore.getState();
      const gameBubbleStore = useGameBubbleStore.getState();
      const roundHint = useRoundHintStore.getState();

      newSubscriptions['messageQueue'] = client.subscribe(
        `/user/queue/system`,
        () => {},
        {
          Authorization: useNicknameStore.getState().nickname,
        },
      );

      newSubscriptions['game-room'] = client.subscribe(
        `/topic/channel/1/room/${roomId}`,
        message => {
          const { type, response } = JSON.parse(message.body);

          if (type === 'roundInfo') {
            gameChatStore.setGameChattings({
              sender: 'system',
              messageType: 'notice',
              message: `곧 다음 라운드가 시작됩니다. `,
            });

            // url, round, mode 설정 및 힌트는 null 처리
            roundInfo.setRoundInfo(response);
            roundHint.updateGameHint(null);

            gameStateStore.setGameState('ROUND_INFO');
          }

          if (type === 'roundOpen') {
            gameStateStore.setGameState('ROUND_OPEN');
          }

          if (type === 'roundStart') {
            gameStateStore.setGameState('ROUND_START');
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

            if (response.winner) {
              gameChatStore.setGameChattings({
                sender: 'system',
                messageType: 'winner',
                message: `${response.winner}님이 정답을 맞췄습니다! `,
              });
            }
          }

          if (type === 'hint') {
            roundHint.updateGameHint(response);
          }

          if (type === 'roomInfo') {
            gameRoomStore.setGameInfo(response);

            if (response.status === 'IN_PROGRESS') {
              gameStateStore.setGameState('ROUND_INFO');
              const initialBoard = useParticipantInfoStore
                .getState()
                .participantInfo.reduce(
                  (acc, participant) => ({ ...acc, [participant.userName]: 0 }),
                  {} as Record<string, number>,
                );

              score.setScores(initialBoard);
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
            score.updateScore(response.username, response.position);
            gameStateStore.setGameState('SCORE_UPDATE');
          }

          if (type === 'refuseEnter') {
            gameStateStore.setGameState('REFUSED');
          }

          if (type === 'gameEnd') {
            gameStateStore.setGameState('GAME_END');
            winnerStore.setWinner(response.winner);
          }

          if (type === 'eventTrigger') {
            const { trigger } = response;
            gameBubbleStore.setEventType('MARK');
            gameBubbleStore.setTriggerUser(trigger);
          }

          if (type === 'event') {
            const { eventType, trigger, target } = response;
            gameBubbleStore.setEventType(eventType);
            gameBubbleStore.setTargetUser(target);
            gameBubbleStore.setTriggerUser(trigger);
          }

          if (type === 'eventEnd') {
            gameBubbleStore.setEventType(null);
            gameBubbleStore.setTargetUser(null);
            gameBubbleStore.setTriggerUser(null);
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
