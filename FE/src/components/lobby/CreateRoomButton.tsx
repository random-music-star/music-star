import RoomFormDialog from '@/components/room/RoomFormDialog';

interface CreateRoomButtonProps {
  onSuccess?: () => void;
}

export default function CreateRoomButton({ onSuccess }: CreateRoomButtonProps) {
  return (
    <RoomFormDialog
      mode='create'
      buttonText='방 생성'
      buttonClassName='bg-blue-600 text-white hover:bg-blue-700'
      onDialogClose={onSuccess}
    />
  );
}
