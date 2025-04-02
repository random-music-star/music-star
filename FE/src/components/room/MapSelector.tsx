import { useEffect, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import BoardMapPreview from '@/components/lobby/BoardMapPreview';
import GeneralMapPreview from '@/components/lobby/GeneralMapPreview';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { GameFormat, RoomFormValues } from '@/types/rooms';

// 맵 데이터 타입 정의
interface MapData {
  id: GameFormat;
  name: string;
}

// Map data without images
const MAPS: MapData[] = [
  {
    id: 'BOARD',
    name: '보드판',
  },
  {
    id: 'GENERAL',
    name: '점수판',
  },
];

interface MapSelectorProps {
  form: UseFormReturn<RoomFormValues>;
  error?: boolean;
}

export default function MapSelector({ form, error }: MapSelectorProps) {
  const [currentMapIndex, setCurrentMapIndex] = useState(0);
  const currentMap = MAPS[currentMapIndex];

  // 맵 변경 시 폼 값 업데이트
  useEffect(() => {
    form.setValue('format', currentMap.id);
    form.trigger('format');
  }, [currentMapIndex, form]);

  // 이전 맵으로 이동
  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMapIndex(prev => (prev === 0 ? MAPS.length - 1 : prev - 1));
  };

  // 다음 맵으로 이동
  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMapIndex(prev => (prev === MAPS.length - 1 ? 0 : prev + 1));
  };

  return (
    <FormField
      control={form.control}
      name='format'
      render={() => (
        <FormItem className='w-full'>
          <FormLabel
            className={`mb-3 flex justify-between text-lg font-bold ${error ? 'label-error' : 'text-[#D7EEA0]'}`}
          >
            <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
              맵 선택
            </span>
            <FormMessage className='form-message' />
          </FormLabel>
          <FormControl>
            <div className='relative flex flex-col items-center overflow-hidden rounded-lg'>
              {/* 맵 이미지 컨테이너 - 반응형으로 수정 */}
              <div className='relative w-full overflow-hidden rounded-lg bg-slate-800 sm:h-24 md:h-40 lg:h-48'>
                {/* 맵 컴포넌트 렌더링 */}
                {currentMap.id === 'BOARD' ? (
                  <BoardMapPreview />
                ) : (
                  <GeneralMapPreview />
                )}

                {/* 네비게이션 버튼 */}
                <button
                  onClick={handlePrev}
                  className='absolute top-1/2 left-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#9F89EB] text-white hover:bg-[#5D42AA] sm:h-10 sm:w-10'
                  aria-label='이전 맵'
                >
                  <ChevronLeft size={20} className='sm:h-6 sm:w-6' />
                </button>
                <button
                  onClick={handleNext}
                  className='absolute top-1/2 right-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#9F89EB] text-white hover:bg-[#5D42AA] sm:h-10 sm:w-10'
                  aria-label='다음 맵'
                >
                  <ChevronRight size={20} className='sm:h-6 sm:w-6' />
                </button>
              </div>

              {/* 맵 선택 인디케이터 */}
              <div className='flex space-x-2 pt-2'>
                {MAPS.map((map, index) => (
                  <div
                    key={map.id}
                    className={`h-2 w-6 cursor-pointer rounded-full sm:w-8 ${
                      index === currentMapIndex ? 'bg-[#9FFCFE]' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentMapIndex(index)}
                  />
                ))}
              </div>

              {/* 맵 이름 표시 */}
              <div className='mb-2 w-28 rounded px-3 py-1 text-center sm:w-32 sm:px-4 sm:py-2'>
                <p className='text-sm font-bold text-white sm:text-base'>
                  {currentMap.name}
                </p>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
