import RoomFormDialog from '@/components/room/RoomFormDialog';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';

interface EditRoomButtonProps {
  roomId: string;
}

export default function EditRoomButton({ roomId }: EditRoomButtonProps) {
  const { gameRoomInfo } = useGameInfoStore();
  const { hostNickname } = useParticipantInfoStore();
  const { nickname } = useNicknameStore();

  // 방장인지 확인
  const isRoomOwner = (hostNickname && hostNickname === nickname) || false;

  // 방 상태 확인
  const status = gameRoomInfo?.status;
  const isWaiting = status === 'WAITING';

  // 방장이 아니거나 대기 중이 아니면 버튼을 렌더링하지 않음
  if (!isRoomOwner || !isWaiting) {
    return null;
  }

  return (
    <RoomFormDialog
      mode='edit'
      roomId={roomId}
      buttonText='수정'
      buttonClassName='px-2 py-1 bg-white text-indigo-600 hover:bg-gray-100 text-xs rounded-md'
    />
  );
}

// import { useState } from 'react';

// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';

// import EditRoomModal from './EditRoomModal';

// export default function EditRoomButton() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <>
//       <Button
//         onClick={() => setIsOpen(true)}
//         className='bg-blue-600 text-white hover:bg-blue-700'
//       >
//         방 정보 수정
//       </Button>

//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogContent className='sm:max-w-[425px]'>
//           <DialogHeader>
//             <DialogTitle>방 정보 수정</DialogTitle>
//             <DialogDescription>
//               게임할 방의 정보를 입력해주세요.
//             </DialogDescription>
//           </DialogHeader>
//           <EditRoomModal onSuccess={() => setIsOpen(false)} />
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
