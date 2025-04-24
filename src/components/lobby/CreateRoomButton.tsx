import RoomFormDialog from '@/components/room/RoomFormDialog';

export default function CreateRoomButton() {
  return (
    <RoomFormDialog
      mode='create'
      buttonText='방 생성'
      buttonClassName='h-auto cursor-pointer bg-[#9FFCFE] text-sm text-black font-bold hover:bg-opacity-80 rounded-full px-5 py-1.5 hover:bg-[#9FFCFE]/80'
    />
  );
}
