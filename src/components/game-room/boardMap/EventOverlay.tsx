import { cn } from '@/lib/utils';
import { EventType } from '@/stores/websocket/useGameBubbleStore';

import EventCard from './EventCard';

const EventOverlay = ({ eventType }: { eventType: EventType }) => {
  return (
    <div className='event-overlay'>
      <div
        className={cn('flip-card-container w-full', {
          'animate-scale-in animate-flip': eventType !== 'MARK',
          'animate-scale-in': eventType === 'MARK',
        })}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className='flip-card-front'
          style={{ backfaceVisibility: 'hidden' }}
        >
          <EventCard eventType={'MARK'} />
        </div>

        <div
          className='flip-card-back'
          style={{ backfaceVisibility: 'hidden' }}
        >
          <EventCard eventType={eventType} />
        </div>
      </div>
    </div>
  );
};

export default EventOverlay;
