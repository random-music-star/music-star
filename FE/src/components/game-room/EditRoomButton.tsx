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
