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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const { form, selectedModes, selectedYears, hasPassword } = useRoomForm({
    initialData,
  });
  // API 통신 로직
  const { loading, submitForm } = useRoomApi({ mode, roomId, onSuccess });

  // 폼 제출 핸들러
  const onSubmit = async (data: RoomFormValues) => {
    await submitForm(data);
  };

  // 모드 레이블 매핑
  const getModeLabel = (mode: Mode) => {
    switch (mode) {
      case 'FULL':
        return '전곡 재생';
      case 'DOUBLE':
        return '2배속';
      case 'AI':
        return 'AI';
      default:
        return mode;
    }
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

          {/* 방 공개 설정 */}
          <FormField
            control={form.control}
            name='hasPassword'
            render={({ field }) => (
              <FormItem className='mb-0'>
                <FormLabel
                  className={`mb-3 flex justify-between text-lg font-bold ${
                    form.formState.errors.hasPassword
                      ? 'text-red-400'
                      : 'text-green-200'
                  } drop-shadow-md`}
                >
                  <span>방 공개 설정</span>
                  <FormMessage className='text-red-400' />
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    className='mb-2 flex items-center space-y-3'
                    value={field.value ? 'true' : 'false'}
                    onValueChange={value => {
                      field.onChange(value === 'true');
                      // 열린 방으로 변경 시 비밀번호 필드 초기화
                      if (value === 'false') {
                        form.setValue('password', '');
                      }
                    }}
                  >
                    <FormItem className='mb-0 flex items-center space-x-3'>
                      <FormControl>
                        <RadioGroupItem
                          value='false'
                          className='h-5 w-5 bg-white'
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer text-base font-semibold text-white'>
                        열린 방
                      </FormLabel>
                    </FormItem>
                    <FormItem className='flex items-center space-x-3'>
                      <FormControl>
                        <RadioGroupItem
                          value='true'
                          className='h-5 w-5 bg-white'
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer text-base font-semibold text-white'>
                        잠금 방
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          {/* 비밀번호 입력 필드 */}
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type='text'
                    disabled={!hasPassword}
                    className={`bg-white ${form.formState.errors.password ? 'border-red-400' : ''}`}
                    placeholder={
                      hasPassword
                        ? '비밀번호를 입력하세요'
                        : '열린 방은 비밀번호가 필요하지 않습니다'
                    }
                  />
                </FormControl>
                <FormMessage className='mt-1 text-red-400' />
              </FormItem>
            )}
          />
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
                  <div className='grid grid-cols-3 gap-3'>
                    {AVAILABLE_MODES.map(mode => (
                      <FormItem key={mode} className='mb-3 flex items-center'>
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
                          {getModeLabel(mode)}
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
