interface SpeechBubble {
  text: string;
  isInProgress: boolean;
}

const SpeechBubble = ({ text, isInProgress }: SpeechBubble) => {
  return (
    <div className='max-h-[200px] min-h-[30px] max-w-[200px] rounded-t-2xl rounded-r-2xl bg-white p-[10px] pl-[12px] text-sm text-purple-800'>
      {isInProgress && text === '.' ? (
        <p className='text-xl font-bold text-red-400'>Skip!</p>
      ) : (
        <p className='line-clamp-4 overflow-hidden break-words'>{text}</p>
      )}
    </div>
  );
};

export default SpeechBubble;
