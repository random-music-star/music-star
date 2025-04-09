import { ChannelMember } from '@/pages/game/lobby/[channelId]';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

interface ChannelMemberListProps {
  members: ChannelMember[];
  isLoading: boolean;
  sseConnected: boolean;
}

export default function ChannelMemberList({
  members,
  isLoading,
  sseConnected,
}: ChannelMemberListProps) {
  const { nickname } = useNicknameStore();

  const getMemberLocation = (member: ChannelMember): string => {
    if (member.inLobby) return '로비';
    if (member.roomStatus === 'WAITING') return '게임 대기중';
    if (member.roomStatus === 'IN_PROGRESS') return '게임 중';
    return '';
  };

  const filteredMembers = members.filter(member => member !== undefined);

  return (
    <div className='h-full p-4 text-white'>
      {/* <h3 className='mb-4 text-xl font-bold'>채널 참가자</h3> */}

      {isLoading ? (
        <div className='flex items-center justify-center py-6'>
          <div
            className='mr-2 h-5 w-5 animate-spin rounded-full border-[3px] border-current border-t-transparent text-indigo-500'
            aria-hidden='true'
          ></div>
          <p className='text-sm text-indigo-400'>참가자 목록 로딩 중...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className='py-6 text-center text-gray-400'>
          <p>참가자가 없습니다</p>
        </div>
      ) : (
        <div className='neon-scrollbar max-h-[calc(100%-10px)] space-y-2 overflow-y-auto'>
          {!sseConnected && (
            <div className='mb-2 rounded bg-yellow-900/30 p-2 text-xs text-yellow-500'>
              ⚠️ 실시간 업데이트가 불가능합니다
            </div>
          )}
          <ul className='space-y-2'>
            {filteredMembers.map(member => {
              const isCurrentUser = member.username === nickname;

              return (
                <li
                  key={member.username}
                  className={`flex items-center justify-between rounded p-2 ${
                    isCurrentUser
                      ? 'border border-indigo-700 bg-indigo-900/60'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <span className='flex items-center truncate'>
                    {isCurrentUser && (
                      <span className='mr-2 rounded-sm bg-indigo-700 px-1.5 py-0.5 text-xs text-white'>
                        나
                      </span>
                    )}
                    {member.username}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      member.inLobby
                        ? 'bg-green-900/30 text-green-500'
                        : member.roomStatus === 'WAITING'
                          ? 'bg-yellow-900/30 text-yellow-500'
                          : 'bg-blue-900/30 text-blue-500'
                    }`}
                  >
                    {getMemberLocation(member)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
