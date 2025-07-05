import { BUBBLE_RIGHT_MAP } from '@/constants/boardMap/bubbleRightMap';
import { useGameDiceStore } from '@/stores/websocket/useGameDiceStore';

import { UserCharacter } from '../GameBoard';
import BubbleContent from './BubbleContent';

interface BubbleProps {
  isActiveDice: boolean;
  character: UserCharacter;
  charWidth: number;
}

const Bubble = ({ isActiveDice, character, charWidth }: BubbleProps) => {
  const { diceUsername } = useGameDiceStore();

  const isLeftSide = BUBBLE_RIGHT_MAP[character.position] || false;
  const bubbleSize = charWidth * 2;

  const bubbleImage = isLeftSide ? '/bubble.svg' : '/bubble_left.svg';
  const bubbleX = character.x - bubbleSize + 20;
  const bubbleY = character.y - bubbleSize + 20 + character.position / 2;
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
