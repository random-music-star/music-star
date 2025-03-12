import { useState } from "react";
import { Room } from "@/pages/lobby";
import RoomItem from "./RoomItem";
import { Button } from "@/components/ui/button";

interface RoomListProps {
  rooms: Room[];
}

export default function RoomList({ rooms }: RoomListProps) {
  const ITEMS_PER_PAGE = 8; // 2 * 4 그리드
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(rooms.length / ITEMS_PER_PAGE);
  const startIdx = currentPage * ITEMS_PER_PAGE;
  const visibleRooms = rooms.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // 서버 통신 필요:
  // 1. 방 클릭 시 방 상태 확인 API 호출 (/api/rooms/{roomId}/status)
  // 2. 상태에 따라 비밀번호 입력, 안내 메시지 표시, 또는 입장 처리

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 flex-1">
        {visibleRooms.map((room) => (
          <RoomItem key={room.id} room={room} />
        ))}

        {/* 빈 방 표시 (8개를 채우기 위함) */}
        {visibleRooms.length < ITEMS_PER_PAGE &&
          Array(ITEMS_PER_PAGE - visibleRooms.length)
            .fill(null)
            .map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="border border-dashed border-[hsl(var(--color-room-border))] rounded-lg h-48 flex items-center justify-center"
              >
                <span className="text-[hsl(var(--color-text-tertiary))]">빈 방</span>
              </div>
            ))
        }
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="border-[hsl(var(--color-room-border))] text-[hsl(var(--color-text-primary))]"
          >
            이전
          </Button>
          <div className="flex items-center">
            <span className="text-[hsl(var(--color-text-primary))]">{currentPage + 1} / {totalPages}</span>
          </div>
          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className="border-[hsl(var(--color-room-border))] text-[hsl(var(--color-text-primary))]"
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}