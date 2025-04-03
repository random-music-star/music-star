import ScoreChatBox from '../ScoreChatBox';
import ScoreboardTable from './ScoreBoardTable';
import ScoreRoundInformation from './ScoreRoundInformation';

const ScoreMap = ({
  nickname,
  roomId,
  channelId,
}: {
  nickname: string;
  roomId: string;
  channelId: string;
}) => {
  return (
    <div className='flex h-full w-full'>
      <div className='flex w-[70%] flex-col pt-10'>
        <div className='mx-auto h-[300px] w-[60%]'>
          <ScoreRoundInformation />
        </div>

        <div className='h-[calc(100vh-380px)] w-full p-2'>
          <ScoreChatBox
            currentUserId={nickname}
            roomId={roomId}
            channelId={channelId}
          />
        </div>
      </div>

      {/* 우측 영역 (1/4) - ScoreboardTable */}
      <div className='h-full w-[30%] overflow-auto p-4'>
        <ScoreboardTable />
      </div>
    </div>
  );
};

export default ScoreMap;
