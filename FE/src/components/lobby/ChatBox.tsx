import { useState } from "react";
import { Button } from "@/components/ui/button";
import ChatMessage from "./ChatMessage";

// 채팅 메시지 타입 정의
interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

interface ChatBoxProps {
  userId: string;
}

export default function ChatBox({ userId }: ChatBoxProps) {
  // 메시지 목록 상태 (UI 테스트용 초기 데이터)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: 'user1',
      text: '안녕하세요!',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      userId: userId, // 현재 사용자
      text: '반갑습니다.',
      timestamp: new Date().toISOString()
    }
  ]);

  // 새 메시지 입력 상태
  const [newMessage, setNewMessage] = useState<string>("");

  // 메시지 전송 함수 (UI만 업데이트)
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: `${Date.now()}`,
      userId,
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  // Enter 키와 Shift+Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault(); // 줄바꿈 기본 동작 방지
        sendMessage();
      }
      // Shift+Enter인 경우 기본 동작(줄바꿈) 유지
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <div className="bg-[hsl(var(--color-chat-header-bg))] text-[hsl(var(--color-chat-header-text))] p-3 rounded-t-lg">
        <h2 className="text-lg font-semibold">로비 채팅</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-[hsl(var(--color-text-secondary))] py-4">
            채팅 메시지가 없습니다.
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.userId === userId}
            />
          ))
        )}
      </div>

      <div className="p-3 border-t border-[hsl(var(--color-room-border))]">
        <div className="flex gap-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="메시지 입력... (Enter: 전송, Shift+Enter: 줄바꿈)"
              className="w-full resize-none border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent"
              rows={2}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-hover))] self-end h-10"
          >
            전송
          </Button>
        </div>
      </div>
    </div>
  );
}