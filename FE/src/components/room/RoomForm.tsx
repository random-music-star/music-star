import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRoomApi } from '@/hooks/useRoomApi';
import { type RoomFormValues, useRoomForm } from '@/hooks/useRoomForm';
import { AVAILABLE_MODES, AVAILABLE_YEARS } from '@/types/rooms';

interface RoomFormProps {
  mode: 'create' | 'edit';
  roomId?: string;
  initialData?: {
    roomTitle?: string;
    format?: 'GENERAL' | 'BOARD';
    mode?: ('FULL' | 'ONE_SEC')[];
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
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* 방 이름 */}
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>방 이름</FormLabel>
              <FormControl>
                <Input {...field} placeholder='방 이름을 입력해주세요' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 포맷 선택 - 방 생성 모드에서만 사용할 경우 mode === 'create' 로 변경 필요요*/}
        {mode && (
          <FormField
            control={form.control}
            name='format'
            render={({ field }) => (
              <FormItem>
                <FormLabel>포맷 선택</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className='flex gap-4'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='BOARD' id='format-board' />
                      <Label htmlFor='format-board'>보드판 모드</Label>
                    </div>
                    {/*
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='GENERAL' id='format-general' />
                        <Label htmlFor='format-general'>점수판 모드</Label>
                      </div>
                    */}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 모드 선택 */}
        <FormField
          control={form.control}
          name='modes'
          render={() => (
            <FormItem>
              <FormLabel>모드 선택</FormLabel>
              <div className='rounded-md border p-4'>
                <div className='grid grid-cols-1 gap-3'>
                  {AVAILABLE_MODES.map(mode => (
                    <FormItem
                      key={mode}
                      className='flex flex-row items-start space-y-0 space-x-3'
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
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer font-normal'>
                        {mode === 'FULL' ? '전곡 재생' : '1초 재생'}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 연도 선택 */}
        <FormField
          control={form.control}
          name='years'
          render={() => (
            <FormItem>
              <FormLabel>연도 선택</FormLabel>
              <div className='rounded-md border p-4'>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                  {AVAILABLE_YEARS.map(year => (
                    <FormItem
                      key={year}
                      className='flex flex-row items-start space-y-0 space-x-3'
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
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer font-normal'>
                        {year}년
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 버튼 */}
        <div className='flex justify-end gap-2'>
          <Button
            variant='outline'
            type='button'
            onClick={onCancel}
            className='border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            취소
          </Button>
          <Button
            type='submit'
            disabled={loading}
            className='bg-blue-500 text-white hover:bg-blue-600'
          >
            {loading
              ? mode === 'create'
                ? '생성 중...'
                : '수정 중...'
              : mode === 'create'
                ? '방 생성'
                : '방 수정'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
