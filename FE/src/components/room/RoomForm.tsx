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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoomApi } from '@/hooks/useRoomApi';
import { type RoomFormValues, useRoomForm } from '@/hooks/useRoomForm';
import { MODE_DICT } from '@/stores/websocket/useGameRoundInfoStore';
import {
  AVAILABLE_MODES,
  AVAILABLE_ROUNDS,
  AVAILABLE_YEARS,
} from '@/types/rooms';
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
    maxGameRound?: number;
    maxPlayer?: number;
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
  const { form, selectedModes, selectedYears, hasPassword, selectedFormat } =
    useRoomForm({
      initialData,
    });
  const { loading, submitForm } = useRoomApi({ mode, roomId, onSuccess });

  const onSubmit = async (data: RoomFormValues) => {
    await submitForm(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='mx-auto flex w-full max-w-6xl flex-col justify-between gap-4 lg:flex-row'
      >
        <section className='w-full space-y-4 px-4 lg:w-1/2'>
          {/* 방 이름 */}
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`mb-2 flex justify-between text-base font-bold ${
                    form.formState.errors.title
                      ? 'text-red-400'
                      : 'text-pink-200'
                  }`}
                >
                  <span className='drop-shadow-md'>방 이름</span>
                  <FormMessage className='text-sm text-red-400' />
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
                  className={`mb-2 flex justify-between text-base font-bold ${
                    form.formState.errors.hasPassword
                      ? 'text-red-400'
                      : 'text-green-200'
                  } drop-shadow-md`}
                >
                  <span>방 공개 설정</span>
                  <FormMessage className='text-sm text-red-400' />
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    className='mb-2 flex items-center space-x-4'
                    value={field.value ? 'true' : 'false'}
                    onValueChange={value => {
                      field.onChange(value === 'true');
                      // 열린 방으로 변경 시 비밀번호 필드 초기화
                      if (value === 'false') {
                        form.setValue('password', '');
                      }
                    }}
                  >
                    <FormItem className='flex items-center space-x-2'>
                      <FormControl>
                        <RadioGroupItem
                          value='false'
                          className='h-4 w-4 bg-white'
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer text-sm font-semibold text-white'>
                        열린 방
                      </FormLabel>
                    </FormItem>
                    <FormItem className='flex items-center space-x-2'>
                      <FormControl>
                        <RadioGroupItem
                          value='true'
                          className='h-4 w-4 bg-white'
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer text-sm font-semibold text-white'>
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
                    className={`bg-white text-sm ${form.formState.errors.password ? 'border-red-400' : ''}`}
                    placeholder={
                      hasPassword
                        ? '비밀번호를 입력하세요'
                        : '열린 방은 비밀번호가 필요하지 않습니다'
                    }
                  />
                </FormControl>
                <FormMessage className='mt-1 text-xs text-red-400' />
              </FormItem>
            )}
          />
        </section>

        <section className='w-full space-y-4 px-4 lg:w-1/2'>
          {/* 최대 라운드 설정 */}
          <FormField
            control={form.control}
            name='maxGameRound'
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`mb-2 flex justify-between text-base font-bold ${
                    form.formState.errors.maxGameRound
                      ? 'text-red-400'
                      : 'text-cyan-200'
                  } drop-shadow-md`}
                >
                  <span>최대 라운드</span>
                  <FormMessage className='text-sm text-red-400' />
                </FormLabel>
                <Select
                  onValueChange={value => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className='w-full bg-white text-sm'>
                      <SelectValue placeholder='라운드 선택' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AVAILABLE_ROUNDS.map(round => (
                      <SelectItem
                        key={round}
                        value={round.toString()}
                        className='text-sm'
                      >
                        {round} 라운드
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {/* 최대 인원수 설정 */}
          <FormField
            control={form.control}
            name='maxPlayer'
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`mb-2 flex justify-between text-base font-bold ${
                    form.formState.errors.maxPlayer
                      ? 'text-red-400'
                      : 'text-amber-200'
                  } drop-shadow-md`}
                >
                  <span>최대 인원</span>
                  <FormMessage className='text-sm text-red-400' />
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={2}
                    max={selectedFormat === 'BOARD' ? 6 : 60}
                    {...field}
                    onChange={e => {
                      const value = parseInt(e.target.value);
                      const min = 2;
                      const max = selectedFormat === 'BOARD' ? 6 : 60;

                      if (value < min) {
                        field.onChange(min);
                      } else if (value > max) {
                        field.onChange(max);
                      } else {
                        field.onChange(value);
                      }
                    }}
                    className={`bg-white text-sm ${form.formState.errors.maxPlayer ? 'border-red-400' : ''}`}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* 모드 선택 */}
          <FormField
            control={form.control}
            name='modes'
            render={() => (
              <FormItem>
                <FormLabel
                  className={`mb-2 flex justify-between text-base font-bold ${
                    form.formState.errors.modes
                      ? 'text-red-400'
                      : 'text-blue-200'
                  } drop-shadow-md`}
                >
                  <span>모드 선택</span>
                  <FormMessage className='text-sm text-red-400' />
                </FormLabel>
                <div>
                  <div className='grid grid-cols-3 gap-2'>
                    {AVAILABLE_MODES.map(mode => (
                      <FormItem key={mode} className='flex items-center'>
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
                            className='h-4 w-4 rounded bg-white shadow-md data-[state=checked]:border-0 data-[state=checked]:bg-white data-[state=checked]:font-bold data-[state=checked]:text-purple-600'
                          />
                        </FormControl>
                        <FormLabel className='ml-1 cursor-pointer text-sm font-semibold text-white'>
                          {MODE_DICT[mode]}
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
                  className={`mb-2 flex justify-between text-base font-bold ${
                    form.formState.errors.years
                      ? 'text-red-400'
                      : 'text-yellow-100'
                  } drop-shadow-md`}
                >
                  <span>연도 선택</span>
                  <FormMessage className='text-sm text-red-400' />
                </FormLabel>
                <div>
                  <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                    {AVAILABLE_YEARS.map(year => (
                      <FormItem key={year} className='flex items-center'>
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
                            className='h-4 w-4 rounded bg-white shadow-md data-[state=checked]:border-0 data-[state=checked]:bg-white data-[state=checked]:font-bold data-[state=checked]:text-purple-600'
                          />
                        </FormControl>
                        <FormLabel className='ml-1 cursor-pointer text-sm font-semibold text-white'>
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
          <div className='mt-6 flex justify-center gap-3'>
            <button
              type='submit'
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
              className='relative flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 text-sm font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70'
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
              className='relative flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 text-sm font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70'
            >
              취소
            </button>
          </div>
        </section>
      </form>
    </Form>
  );
}
