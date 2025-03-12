import { useEffect, useState } from 'react';
import SocketLayout from '@/components/layouts/SocketLayout';
import { useWebSocketStore } from '@/stores/useWebsocketStore';
import Link from 'next/link';
import Header from "@/components/lobby/Header";
import RoomList from "@/components/lobby/RoomList";
import ChatBox from "@/components/lobby/ChatBox";
import CreateRoomButton from "@/components/lobby/CreateRoomButton";

// Room 타입 정의
export type Room = {
  id: string;
  name: string;
  isLocked: boolean;
  currentUsers: number;
  maxUsers: number;
  gameModes: string[];
};

const LobbyPage = () => {
  // Socket 관련 (하은)
  const { sendMessage, updateSubscription, isConnected, publicChattings } =
    useWebSocketStore();
  const [inputValue, setInputValue] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    updateSubscription('channel');
  }, [isConnected]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('입력된 값:', inputValue);
    sendMessage('/app/channel/1', {
      type: 'chatting',
      request: {
        sender: 'hoberMin',
        message: inputValue,
      },
    });

    setInputValue('');
  };

  // UI 관련 (민지)
  const rooms: Room[] = [
    {
      id: "1234",
      name: "즐거운 노래방",
      isLocked: false,
      currentUsers: 3,
      maxUsers: 8,
      gameModes: ["전곡 모드"]
    },
    {
      id: "2345",
      name: "가사 맞추기 대회",
      isLocked: false,
      currentUsers: 2,
      maxUsers: 4,
      gameModes: ["전곡 모드"]
    },
    {
      id: "3456",
      name: "아이돌 노래 전문",
      isLocked: true,
      currentUsers: 4,
      maxUsers: 6,
      gameModes: ["전곡 모드"]
    },
    {
      id: "4567",
      name: "트로트만 불러요",
      isLocked: false,
      currentUsers: 1,
      maxUsers: 8,
      gameModes: ["전곡 모드"]
    }
  ];

  const userId = "노래천사123";

  return (
    <SocketLayout>
      <div className="flex flex-col h-screen bg-gray-100">
        <Header userId={userId} />
        <div className="flex flex-1 overflow-hidden">
          {/* 메인 콘텐츠 영역 (방 목록 + 생성 버튼) */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">게임 방 목록</h1>
              <CreateRoomButton />
            </div>

            <div className="flex-1 overflow-y-auto">
              <RoomList rooms={rooms} />
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="w-80 border-l border-gray-300 bg-white">
            <ChatBox userId={userId} />
          </div>
        </div>
      </div>
      {/* 채팅 내 메시지 전송 form - 하은 */}
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={inputValue}
          onChange={handleChange}
          placeholder='입력하세요'
        />
        <button type='submit'>전송</button>
      </form>
      <div>
        {publicChattings.map(chat => (
          <p
            key={`${chat.messageType} - ${chat.message}`}
          >{`[${chat.messageType}] ${chat.sender}: ${chat.message}`}</p>
        ))}
      </div>
      <Link href='/game-room'>게임</Link>
    </SocketLayout>
  );
};

export default LobbyPage;
