import { Room } from "@/pages/lobby";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoomItemProps {
  room: Room;
}

export default function RoomItem({ room }: RoomItemProps) {
  // 서버 통신 필요:
  // 1. 방 클릭 시 상위 컴포넌트의 방 입장 처리 함수 호출

  return (
    <Card
      className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer border-[hsl(var(--color-room-border))]"
    // onClick={() => onRoomClick(room.id)} // 실제 구현 시 활성화
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg truncate text-[hsl(var(--color-text-primary))]" title={room.name}>
            {room.name}
          </CardTitle>
          {room.isLocked && (
            <span className="text-xs text-[hsl(var(--color-icon-locked))]">잠금방</span>
          )}
        </div>
        <div className="text-sm text-[hsl(var(--color-text-secondary))]">#{room.id}</div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-1 text-sm text-[hsl(var(--color-text-primary))]">
          <span>인원:</span>
          <span>{room.currentUsers} / {room.maxUsers}</span>
        </div>

        <div className="mt-2">
          <div className="flex gap-1 flex-wrap">
            {room.gameModes.map((mode) => (
              <Badge
                key={mode}
                variant="secondary"
                className="text-xs bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]"
              >
                {mode}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}