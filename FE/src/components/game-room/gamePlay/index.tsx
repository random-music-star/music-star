import React, { useEffect, useRef, useState } from 'react';

import { useGameChatStore } from '@/stores/websocket/useGameChatStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { Chatting } from '@/types/websocket';

import GamePlayPanel from '../GameBoard/GamePlayPanel';
import SpeechBubble from './SpeechBubble';

interface UserCharacter {
  name: string;
  image: HTMLImageElement | null;
  chatting?: string;
  chattingCoord?: { x: number; y: number };
}

const chatCoordinates = [
  { x: 282, y: 250 },
  { x: 412, y: 330 },
  { x: 552, y: 215 },
  { x: 672, y: 265 },
  { x: 802, y: 175 },
  { x: 932, y: 235 },
];

const GamePlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { participantInfo } = useParticipantInfoStore();
  const { gameChattings } = useGameChatStore();
  const [characters, setCharacters] = useState<UserCharacter[]>([]);

  const timeoutMapRef = useRef<Record<string, NodeJS.Timeout>>({});

  const handleSpeech = ({ sender, message }: Chatting) => {
    if (timeoutMapRef.current[sender]) {
      clearTimeout(timeoutMapRef.current[sender]);
    }

    setCharacters(prev =>
      prev.map(char =>
        char.name === sender ? { ...char, chatting: message } : char,
      ),
    );

    const timeoutId = setTimeout(() => {
      setCharacters(prev =>
        prev.map(char =>
          char.name === sender ? { ...char, chatting: undefined } : char,
        ),
      );
      delete timeoutMapRef.current[sender];
    }, 3000);

    timeoutMapRef.current[sender] = timeoutId;
  };

  useEffect(() => {
    if (
      gameChattings.at(-1) &&
      gameChattings.at(-1)?.messageType === 'default'
    ) {
      handleSpeech(gameChattings.at(-1)!);
    }
  }, [gameChattings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const staffImage = new Image();
    staffImage.onload = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const staffOriginalWidth = 1000;
      const staffOriginalHeight = 230;

      const scale = Math.min(
        canvasWidth / staffOriginalWidth,
        canvasHeight / staffOriginalHeight,
      );

      const staffWidth = staffOriginalWidth * scale;
      const staffHeight = staffOriginalHeight * scale;

      const staffX = (canvasWidth - staffWidth) / 2;
      const staffY = (canvasHeight - staffHeight) / 2;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(staffImage, staffX, staffY, staffWidth, staffHeight);

      // 캐릭터 기준 좌표
      const originalCoordinates = [
        { x: 232, y: 100 },
        { x: 362, y: 180 },
        { x: 492, y: 65 },
        { x: 622, y: 115 },
        { x: 752, y: 25 },
        { x: 882, y: 85 },
      ];

      const coordinates = originalCoordinates.map(coord => ({
        x: staffX + coord.x * scale,
        y: staffY + coord.y * scale,
      }));

      const loadCharacters = async () => {
        const userCharacters: UserCharacter[] = await Promise.all(
          participantInfo.map(
            (participant, index) =>
              new Promise<UserCharacter>(resolve => {
                const characterImg = new Image();
                characterImg.src = participant.character;
                characterImg.onload = () => {
                  resolve({
                    name: participant.userName,
                    image: characterImg,
                    chattingCoord: chatCoordinates[index],
                  });
                };
              }),
          ),
        );

        setCharacters(userCharacters);

        // 캐릭터 이미지 및 이름 그리기
        userCharacters.forEach((character, index) => {
          if (!character.image) return;
          const coord = coordinates[index];
          const characterWidth = 80 * scale;
          const characterHeight = 90 * scale;

          ctx.drawImage(
            character.image,
            coord.x - characterWidth / 2,
            coord.y - characterHeight / 2,
            characterWidth,
            characterHeight,
          );

          ctx.font = `${12 * scale}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          const textY = coord.y + characterHeight / 2 + 15;

          ctx.strokeStyle = 'black';
          ctx.lineWidth = 3;
          ctx.strokeText(character.name, coord.x, textY);

          ctx.fillStyle = 'white';
          ctx.fillText(character.name, coord.x, textY);
        });
      };

      loadCharacters();
    };

    staffImage.src = '/staff.svg';
  }, [participantInfo]);

  return (
    <div>
      <div className='flex items-center justify-center p-8'>
        <GamePlayPanel />
      </div>
      <div className='relative flex h-full w-full flex-col justify-center'>
        <canvas ref={canvasRef} className='h-full w-full' />
        {characters.map(char => {
          if (!char.chatting || !char.chattingCoord) return null;

          const canvas = canvasRef.current;
          if (!canvas) return null;

          return (
            <div
              key={char.name}
              className='absolute'
              style={{
                left: `${char.chattingCoord.x}px`,
                top: `${char.chattingCoord.y}px`,

                transform: 'translateY(-100%)',
              }}
            >
              <SpeechBubble text={char.chatting} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamePlay;
