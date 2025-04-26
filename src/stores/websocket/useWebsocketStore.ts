import { Client, StompSubscription } from '@stomp/stompjs';
import { getCookie } from 'cookies-next';
import { create } from 'zustand';

import { COOKIE_NAME } from '@/api/core';
import { WebSocketState } from '@/types/websocket';

import { useSoundEventStore } from '../useSoundEventStore';
import { useGameBubbleStore } from './useGameBubbleStore';
import { useGameChatStore } from './useGameChatStore';
import { useGameDiceStore } from './useGameDiceStore';
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
      connectHeaders: {
        Authorization: `Bearer ${getCookie(COOKIE_NAME)}`,
      },
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

  updateSubscription: (
    subscriptionType: string,
    channelId: string,
    roomId?: string,
  ) => {
    const { client, subscriptions } = get();

    if (!client || !client.connected) return;

    Object.values(subscriptions).forEach(sub => sub?.unsubscribe());

    useGameChatStore.getState().resetGameChatStore();
    useGameStateStore.getState().resetGameState();
    usePublicChatStore.getState().resetPublicChatStore();
    useGameWinnerStore.getState().resetWinnerStore();
    useParticipantInfoStore.getState().resetParticipantInfo();
    useSoundEventStore.getState().setSoundEvent(null);
    useGameRoundInfoStore.getState().resetRoundInfo();
    useGameInfoStore.getState().setGameInfo(null);

    const newSubscriptions: Record<string, StompSubscription> = {};

    if (subscriptionType === 'channel') {
      const gameStateStore = useGameStateStore.getState();

      newSubscriptions['channel'] = client.subscribe(
        `/topic/channel/${channelId}`,
        message => {
          const { response } = JSON.parse(message.body);
          usePublicChatStore.getState().setPublicChattings(response);
        },
        {
          Authorization: `Bearer ${getCookie(COOKIE_NAME)}`,
        },
      );

      newSubscriptions['messageQueue'] = client.subscribe(
        `/user/queue/system`,
        message => {
          const { type } = JSON.parse(message.body);

          if (type === 'refuseEnter') {
            gameStateStore.setGameState('REFUSED');
          }
        },
        {
          Authorization: `Bearer ${getCookie(COOKIE_NAME)}`,
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
      const soundEventStore = useSoundEventStore.getState();
      const gameDiceStore = useGameDiceStore.getState();

      newSubscriptions['messageQueue'] = client.subscribe(
        `/user/queue/system`,
        message => {
          const { type } = JSON.parse(message.body);

          if (type === 'refuseEnter') {
            gameStateStore.setGameState('REFUSED');
          }
        },
        {
          Authorization: `Bearer ${getCookie(COOKIE_NAME)}`,
        },
      );

      newSubscriptions['game-room'] = client.subscribe(
        `/topic/channel/${channelId}/room/${roomId}`,
        message => {
          const { type, response } = JSON.parse(message.body);

          if (type === 'roundInfo') {
            gameChatStore.setGameChattings({
              sender: 'system',
              messageType: 'notice',
              message: `곧 다음 라운드가 시작됩니다. `,
            });

            roundInfo.setRoundInfo(response);
            roundHint.updateGameHint(null);
            useGameRoundResultStore.getState().setGameRoundResult(null);

            gameStateStore.setGameState('ROUND_INFO');
            soundEventStore.setSoundEvent('ROULETTE');
          }

          if (type === 'roundOpen') {
            gameStateStore.setGameState('ROUND_OPEN');
            soundEventStore.setSoundEvent('ROULETTE_RESULT');
          }

          if (type === 'roundStart') {
            gameStateStore.setGameState('ROUND_START');

            const currentRound =
              useGameRoundInfoStore.getState().roundInfo.round;

            const maxRound =
              useGameInfoStore.getState().gameRoomInfo?.maxGameRound;

            if (maxRound) {
              const remainRound = maxRound - currentRound + 1;

              if (remainRound > 3) return;
              if (remainRound === 1) {
                gameChatStore.setGameChattings({
                  sender: 'system',
                  messageType: 'warning',
                  message: `마지막 라운드입니다!`,
                });
                return;
              }
              gameChatStore.setGameChattings({
                sender: 'system',
                messageType: 'warning',
                message: `${remainRound}라운드 남았습니다!`,
              });
            }
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
            if (useGameRoundResultStore.getState().gameRoundResult) {
              gameStateStore.setGameState('SCORE_UPDATE');
              gameDiceStore.setDice(response);
            }
          }

          if (type === 'gameResult') {
            gameRoundResult.setGameRoundResult(response);
            gameStateStore.setGameState('GAME_RESULT');
            soundEventStore.setSoundEvent('CORRECT');

            if (response.winner) {
              gameChatStore.setGameChattings({
                sender: 'system',
                messageType: 'winner',
                message: `${response.winner}님이 정답을 맞혔습니다! `,
              });
            }
          }

          if (type === 'hint') {
            roundHint.updateGameHint(response);
          }

          if (type === 'gameStart') {
            gameStateStore.setGameState('ROUND_INFO');
            const initialBoard = useParticipantInfoStore
              .getState()
              .participantInfo.reduce(
                (acc, participant) => ({ ...acc, [participant.userName]: 0 }),
                {} as Record<string, number>,
              );

            score.setScores(initialBoard);
          }

          if (type === 'roomInfo') {
            gameRoomStore.setGameInfo(response);
          }

          if (type === 'userInfo') {
            participantInfoStore.setParticipantInfo(response.userInfoList);
            participantInfoStore.setIsAllReady(response.allReady);
          }

          if (type === 'diceStart') {
            gameDiceStore.setIsActiveDice(true);
          }
          if (type === 'diceEnd') {
            gameDiceStore.setIsActiveDice(false);
          }

          if (type === 'move') {
            score.updateScore(response.username, response.position);
            gameStateStore.setGameState('SCORE_UPDATE');
          }

          if (type === 'gameEnd') {
            gameStateStore.setGameState('GAME_END');
            winnerStore.setWinner(response.winner);
            participantInfoStore.resetReadyInfo();
          }

          if (type === 'eventTrigger') {
            const { trigger } = response;
            gameBubbleStore.setEventType('MARK');
            gameBubbleStore.setTriggerUser(trigger);
            soundEventStore.setSoundEvent('EVENT_CARD');
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
          Authorization: `Bearer ${getCookie(COOKIE_NAME)}`,
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
