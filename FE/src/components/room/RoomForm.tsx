import { useState } from 'react';

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
  // useRoomApi에서 error 상태도 가져옴
  const { loading, error, submitForm } = useRoomApi({
    mode,
    roomId,
    onSuccess,
  });
  // 폼 제출 에러를 관리하기 위한 상태
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: RoomFormValues) => {
    // 폼 제출 시 에러 상태 초기화
    setFormSubmitError(null);

    try {
      // submitForm 결과가 false인 경우 에러 처리
      const success = await submitForm(data);
      if (!success) {
        setFormSubmitError('방 생성/수정 중 오류가 발생했습니다.');
      }
    } catch (err) {
      // 예상치 못한 에러 처리
      console.error('Unexpected error:', err);
      setFormSubmitError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='m-3 mx-auto flex w-full max-w-6xl flex-col justify-between gap-4 lg:flex-row'
      >
        <section className='w-full space-y-6 px-4 lg:w-1/2'>
          {/* 방 이름 */}
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='mb-6'>
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
            <div className='mb-6'>
              <MapSelector
                form={form}
                error={!!form.formState.errors.format}
                initialFormat={
                  mode === 'edit' ? initialData?.format : undefined
                }
                mode={mode}
              />
            </div>
          )}

          {/* 방 공개 설정 */}
          <FormField
            control={form.control}
            name='hasPassword'
            render={({ field }) => (
              <FormItem className='mb-0'>
                <FormLabel
                  className={`mb-2 flex justify-between text-base font-bold ${
                    form.formState.errors.hasPassword ||
                    (form.formState.errors.password && hasPassword)
                      ? 'text-red-400'
                      : 'text-green-200'
                  } drop-shadow-md`}
                >
                  <span>방 공개 설정</span>
                  <FormMessage className='text-sm text-red-400'>
                    {hasPassword ? form.formState.errors.password?.message : ''}
                  </FormMessage>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    className='mb-2 flex items-center space-x-4'
                    value={field.value ? 'true' : 'false'}
                    onValueChange={value => {
                      field.onChange(value === 'true');
                      if (value === 'false') {
                        form.setValue('password', '');
                        form.clearErrors('password');
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
              <FormItem className='mb-6'>
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
              </FormItem>
            )}
          />
        </section>

        <section className='flex w-full flex-col justify-between space-y-4 px-4 lg:w-1/2'>
          <div className='space-y-6'>
            {/* 최대 라운드 설정 */}
            <FormField
              control={form.control}
              name='maxGameRound'
              render={({ field }) => (
                <FormItem className='mb-6'>
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
                <FormItem className='mb-6'>
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
                <FormItem className='mb-6'>
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
                <FormItem className='mb-6'>
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
          </div>

          {/* 에러 메시지 표시 영역 */}
          {(error || formSubmitError) && (
            <div className='w-full rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700'>
              {formSubmitError ||
                error?.message ||
                '오류가 발생했습니다. 다시 시도해주세요.'}
            </div>
          )}

          {/* 버튼 섹션 */}
          <div className='mt-6 flex justify-center gap-3'>
            <button
              type='button'
              onClick={onCancel}
              className='relative flex h-[50px] w-[50px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 text-sm font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70'
            >
              취소
            </button>
            <button
              type='submit'
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
              className='relative flex h-[50px] w-[50px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 text-sm font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70'
            >
              {loading ? '처리중' : mode === 'create' ? '생성' : '수정'}
            </button>
          </div>
        </section>
      </form>
    </Form>
  );
}
