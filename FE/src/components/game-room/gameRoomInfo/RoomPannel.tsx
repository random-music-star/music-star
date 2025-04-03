import RoomInfo from './RoomInfo';

const RoomPannel = () => {
  return (
    <div className='w-full bg-black/30 backdrop-blur-2xl'>
      <div className='flex flex-col items-center justify-center'>
        <RoomInfo />
      </div>
    </div>
  );
};

export default RoomPannel;
