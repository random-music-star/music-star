import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import RoomFormDialog from '@/components/room/RoomFormDialog';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';

export default function EditRoomButton() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>('');

  // URL에서 roomId 추출
  useEffect(() => {
    if (router.isReady) {
      const path = router.asPath;
      const segments = path.split('/');
      // URL 패턴이 /game/room/1/roomId 형태이므로 마지막 부분이 roomId
      const lastSegment = segments[segments.length - 1];
      setRoomId(lastSegment);

      console.log('URL Path:', path);
      console.log('Extracted roomId:', lastSegment);
    }
  }, [router.isReady, router.asPath]);

  const { gameRoomInfo } = useGameInfoStore();
  const { hostNickname } = useParticipantInfoStore();
  const { nickname } = useNicknameStore();

  // 방장인지 확인
  const isRoomOwner = (hostNickname && hostNickname === nickname) || false;

  // 방 상태 확인
  const status = gameRoomInfo?.status;
  const isWaiting = status === 'WAITING';

  // 디버깅용 로그
  useEffect(() => {
    console.log('roomId:', roomId);
    console.log('hostNickname:', hostNickname);
    console.log('nickname:', nickname);
    console.log('isRoomOwner:', isRoomOwner);
    console.log('status:', status);
    console.log('isWaiting:', isWaiting);

    // 모든 조건이 충족되는지 확인
    const shouldRenderButton = isRoomOwner && isWaiting && roomId;
    console.log('Should render button:', shouldRenderButton);
  }, [roomId, hostNickname, nickname, isRoomOwner, status, isWaiting]);

  // 즉시 실행되는 렌더링 조건 확인이 아닌, 모든 상태가 업데이트된 후에 조건 확인
  if (!roomId || !isRoomOwner || !isWaiting) {
    return null;
  }

  return (
    <RoomFormDialog
      mode='edit'
      roomId={roomId}
      buttonText='수정'
      buttonClassName='ml-2 rounded-full px-3 py-0 border border-fuchsia-400/50 bg-fuchsia-900/30 text-xs font-medium hover:bg-fuchsia-800/60'
    />
  );
}
