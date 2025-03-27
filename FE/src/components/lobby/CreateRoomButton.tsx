import RoomFormDialog from '@/components/room/RoomFormDialog';

interface CreateRoomButtonProps {
  onSuccess?: () => void;
}

export default function CreateRoomButton({ onSuccess }: CreateRoomButtonProps) {
  return (
    <RoomFormDialog
      mode='create'
      buttonText='방 생성'
      buttonClassName='bg-[#9FFCFE] text-black font-bold hover:bg-opacity-80 rounded-full px-6'
      onDialogClose={onSuccess}
    />
  );
}
