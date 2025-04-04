import RoomFormDialog from '@/components/room/RoomFormDialog';

export default function CreateRoomButton() {
  return (
    <RoomFormDialog
      mode='create'
      buttonText='방 생성'
      buttonClassName='bg-[#9FFCFE] text-black font-bold hover:bg-opacity-80 rounded-full px-6 hover:bg-[#9FFCFE]/80'
    />
  );
}
