interface ChatMessageProps {
  message: {
    userId: string;
    text: string;
    timestamp: string;
  };
  isCurrentUser: boolean;
}

export default function ChatMessage({
  message,
  isCurrentUser,
}: ChatMessageProps) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
    >
      {!isCurrentUser && (
        <div className='ml-1 text-xs text-[hsl(var(--color-text-secondary))]'>
          {message.userId}
        </div>
      )}

      <div className='flex items-end gap-1'>
        {isCurrentUser && (
          <div className='text-xs text-[hsl(var(--color-text-secondary))]'>
            {formattedTime}
          </div>
        )}

        <div
          className={`max-w-[80%] rounded-lg px-3 py-2 break-words whitespace-pre-wrap ${
            isCurrentUser
              ? 'bg-[hsl(var(--color-message-sender))] text-[hsl(var(--color-message-text-sender))]'
              : 'bg-[hsl(var(--color-message-receiver))] text-[hsl(var(--color-message-text))]'
          }`}
        >
          {message.text}
        </div>

        {!isCurrentUser && (
          <div className='text-xs text-[hsl(var(--color-text-secondary))]'>
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
}
