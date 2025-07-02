import { bubbleRightMap } from '@/constants/boardMap/bubbleRightMap';
import { useGameDiceStore } from '@/stores/websocket/useGameDiceStore';

import { UserCharacter } from '../GameBoard';
import BubbleContent from './BubbleContent';

interface BubbleProps {
  isActiveDice: boolean;
  character: UserCharacter;
  charWidth: number;
  characterX: number;
  characterY: number;
}

const Bubble = ({
  isActiveDice,
  character,
  charWidth,
  characterX,
  characterY,
}: BubbleProps) => {
  const { diceUsername } = useGameDiceStore();

  const isLeftSide = bubbleRightMap[character.position] || false;
  const bubbleSize = charWidth * 2;

  const bubbleImage = isLeftSide ? '/bubble.svg' : '/bubble_left.svg';
  const bubbleX = characterX - bubbleSize + 20;
  const bubbleY = characterY - bubbleSize + 20 + character.position / 2;
  const isCurrentPlayer = character.name === diceUsername;

  return (
    <div
      className='bubble'
      style={{
        position: 'absolute',
        left: isLeftSide ? `${bubbleX + 210}px` : `${bubbleX}px`,
        top: `${bubbleY}px`,
        width: `${bubbleSize}px`,
        height: `${bubbleSize}px`,
        backgroundImage: `url(${bubbleImage})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 10,
        opacity: isActiveDice && isCurrentPlayer ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      <BubbleContent isActive={isActiveDice && isCurrentPlayer} />
    </div>
  );
};

export default Bubble;
