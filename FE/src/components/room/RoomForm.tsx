import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRoomApi } from '@/hooks/useRoomApi';
import { type RoomFormValues, useRoomForm } from '@/hooks/useRoomForm';
import { AVAILABLE_MODES, AVAILABLE_YEARS } from '@/types/rooms';
import { Mode } from '@/types/websocket';

import MapSelector from './MapSelector';

interface RoomFormProps {
  mode: 'create' | 'edit';
  roomId?: string;
  initialData?: {
    roomTitle?: string;
    format?: 'GENERAL' | 'BOARD';
    mode?: Mode[];
    selectedYear?: number[];
    hasPassword?: boolean;
  };
  onSuccess: (data: RoomFormValues, roomId?: string) => void;
  onCancel: () => void;
}

export default function RoomForm({
  mode,
  roomId,
  initialData,
  onSuccess,
  onCancel,
}: RoomFormProps) {
  // 폼 로직
  const { form, selectedModes, selectedYears } = useRoomForm({ initialData });
  // API 통신 로직
  const { loading, submitForm } = useRoomApi({ mode, roomId, onSuccess });

  // 폼 제출 핸들러
  const onSubmit = async (data: RoomFormValues) => {
    await submitForm(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='mx-auto flex w-full max-w-6xl flex-col justify-between gap-8 lg:flex-row'
      >
        <section className='mt-4 w-full space-y-6 px-6 lg:w-1/2'>
          {/* 방 이름 */}
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`mb-3 flex justify-between text-lg font-bold ${
                    form.formState.errors.title
                      ? 'text-red-400'
                      : 'text-pink-200'
                  }`}
                >
                  <span className='drop-shadow-md'>방 이름</span>
                  <FormMessage className='text-red-400' />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={`bg-white ${form.formState.errors.title ? 'border-red-400' : ''}`}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* 맵 선택 - 새로운 비주얼 맵 선택기 */}
          {mode && (
            <MapSelector form={form} error={!!form.formState.errors.format} />
          )}
        </section>

        <section className='mt-4 w-full space-y-6 px-6 lg:w-1/2'>
          {/* 모드 선택 */}
          <FormField
            control={form.control}
            name='modes'
            render={() => (
              <FormItem>
                <FormLabel
                  className={`mb-3 flex justify-between text-lg font-bold ${
                    form.formState.errors.modes
                      ? 'text-red-400'
                      : 'text-blue-200'
                  } drop-shadow-md`}
                >
                  <span>모드 선택</span>
                  <FormMessage className='text-red-400' />
                </FormLabel>
                <div>
                  <div className='grid grid-cols-1 gap-3'>
                    {AVAILABLE_MODES.map(mode => (
                      <FormItem
                        key={mode}
                        className='mb-3 flex items-center last:mb-0'
                      >
                        <FormControl>
                          <Checkbox
                            checked={selectedModes.includes(mode)}
                            onCheckedChange={checked => {
                              const updatedModes = checked
                                ? [...selectedModes, mode]
                                : selectedModes.filter(m => m !== mode);
                              form.setValue('modes', updatedModes);
                              form.trigger('modes');
                            }}
                            className='h-5 w-5 rounded bg-white shadow-md data-[state=checked]:border-0 data-[state=checked]:bg-white data-[state=checked]:font-bold data-[state=checked]:text-purple-600'
                          />
                        </FormControl>
                        <FormLabel className='ml-2 cursor-pointer text-base font-semibold text-white'>
                          {mode === 'FULL' ? '전곡 재생' : '1초 재생'}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                </div>
              </FormItem>
            )}
          />

          {/* 연도 선택 */}
          <FormField
            control={form.control}
            name='years'
            render={() => (
              <FormItem>
                <FormLabel
                  className={`mb-3 flex justify-between text-lg font-bold ${
                    form.formState.errors.years
                      ? 'text-red-400'
                      : 'text-yellow-100'
                  } drop-shadow-md`}
                >
                  <span>연도 선택</span>
                  <FormMessage className='text-red-400' />
                </FormLabel>
                <div>
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                    {AVAILABLE_YEARS.map(year => (
                      <FormItem
                        key={year}
                        className='mb-3 flex items-center last:mb-0'
                      >
                        <FormControl>
                          <Checkbox
                            checked={selectedYears.includes(year)}
                            onCheckedChange={checked => {
                              const updatedYears = checked
                                ? [...selectedYears, year]
                                : selectedYears.filter(y => y !== year);
                              form.setValue('years', updatedYears);
                              form.trigger('years');
                            }}
                            className='h-5 w-5 rounded bg-white shadow-md data-[state=checked]:border-0 data-[state=checked]:bg-white data-[state=checked]:font-bold data-[state=checked]:text-purple-600'
                          />
                        </FormControl>
                        <FormLabel className='ml-2 cursor-pointer text-base font-semibold text-white'>
                          {year}년
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                </div>
              </FormItem>
            )}
          />

          {/* 버튼 섹션 */}
          <div className='mt-12 flex justify-center gap-4 px-6'>
            <button
              type='submit'
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
              className='relative flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70'
            >
              {loading
                ? mode === 'create'
                  ? '생성 중...'
                  : '수정 중...'
                : mode === 'create'
                  ? '생성'
                  : '수정'}
            </button>
            <button
              type='button'
              onClick={onCancel}
              className='relative flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70'
            >
              취소
            </button>
          </div>
        </section>
      </form>
    </Form>
  );
}
