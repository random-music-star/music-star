import Image from 'next/image';

import { EventType } from '@/stores/websocket/useGameBubbleStore';

interface EventContent {
  title: string;
  explanation: string;
}

const EventCentent: Record<EventType, EventContent> = {
  BOMB: { title: '폭탄', explanation: '뒤로 5칸 이동해요' },
  CLOVER: { title: '클로버', explanation: '앞으로 5칸 이동해요' },
  MAGNET: {
    title: '자석',
    explanation: '가장 가까운 플레이어의 위치로 이동해요',
  },
  MINUS: {
    title: '마이너스',
    explanation: '랜덤으로 1칸 혹은 2칸 뒤로 이동해요',
  },
  NOTHING: {
    title: '통과!',
    explanation: '다행히 아무 일도 일어나지 않았어요',
  },
  PLUS: {
    title: '플러스',
    explanation: '랜덤으로 1칸 혹은 2칸 앞으로 이동해요',
  },
  PULL: {
    title: '당기기',
    explanation: '랜덤으로 한명의 플레이어를 당겨요',
  },
  SWAP: {
    title: '스위치',
    explanation: '랜덤으로 한명의 플레이어와 자리를 바꿔요',
  },
  WARP: { title: '워프', explanation: '어딘가로 이동해요' },
  MARK: {
    title: '이벤트 발생!!',
    explanation: '어떤 이벤트가 발생했는지 확인해볼까요?',
  },
  OVERLAP: {
    title: '따라잡기',
    explanation: '따라 잡은 플레이어를 뒤로 보내요',
  },
};

const EventCard = ({ eventType }: { eventType: EventType }) => {
  const emojiUrl = `/eventemoji/${(eventType || 'NOTHING').toLowerCase()}.svg`;

  return (
    <div className='event-card flex items-center justify-center gap-10 rounded-2xl bg-white p-[80px] shadow-xl shadow-white/70'>
      <div className='flex h-40 w-40 items-center justify-center'>
        <Image
          src={emojiUrl}
          width={210}
          height={210}
          alt='event'
          className='event-emoji object-contain'
          style={{ objectFit: 'contain' }}
        />
      </div>

      <div className='flex max-w-[170px] min-w-[100px] flex-col flex-wrap items-center justify-center gap-5'>
        <h3 className='text-3xl font-bold text-purple-900/80'>
          {EventCentent[eventType].title}
        </h3>
        <p className='text-xl text-gray-800'>
          {EventCentent[eventType].explanation}
        </p>
      </div>
    </div>
  );
};

export default EventCard;
