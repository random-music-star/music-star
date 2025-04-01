import ScoreChatBox from '../ScoreChatBox';
import ScoreboardTable from './ScoreBoardTable';
import ScoreRoundInformation from './ScoreRoundInformation';

const ScoreMap = ({
  nickname,
  roomId,
}: {
  nickname: string;
  roomId: string;
}) => {
  return (
    <div className='flex h-full w-full'>
      {/* 좌측 영역 (3/4) - ScoreRoundInformation과 채팅 */}
      <div className='flex w-[70%] flex-col pt-10'>
        {/* 상단: ScoreRoundInformation - 고정 높이 */}
        <div className='mx-auto h-[300px] w-[60%]'>
          <ScoreRoundInformation />
        </div>

        {/* 하단: 채팅 - 고정 높이 */}
        <div className='h-[calc(100vh-380px)] w-full p-2'>
          <ScoreChatBox currentUserId={nickname} roomId={roomId} />
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
