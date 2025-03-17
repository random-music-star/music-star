import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
// rooms.ts에서 가져온 타입과 상수
import {
  AVAILABLE_MODES,
  AVAILABLE_YEARS,
  CreateRoomRequest,
  CreateRoomResponse,
  createRoomFormSchema,
} from '@/types/rooms';

interface CreateRoomFormProps {
  onSuccess: () => void;
}

// Zod 스키마 확장 - 비밀번호 필드 제거
const extendedFormSchema = createRoomFormSchema;

type ExtendedFormValues = z.infer<typeof extendedFormSchema>;

export default function CreateRoomForm({ onSuccess }: CreateRoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { nickname } = useNicknameStore();

  // React Hook Form 설정
  const form = useForm<ExtendedFormValues>({
    resolver: zodResolver(extendedFormSchema),
    defaultValues: {
      title: '',
      format: 'BOARD',
      modes: [],
      years: [],
    },
  });

  // 폼 상태 가져오기
  const selectedModes = form.watch('modes');
  const selectedYears = form.watch('years');

  // 체크박스 핸들러는 아래 UI 코드에서 인라인으로 처리하므로 별도 함수 불필요

  // 폼 제출 핸들러
  const onSubmit = async (data: ExtendedFormValues) => {
    setLoading(true);

    const requestData: CreateRoomRequest = {
      title: data.title,
      password: '', // 빈 문자열로 하드코딩
      format: data.format,
      gameModes: data.modes,
      selectedYears: data.years,
    };

    try {
      console.log('Sending request data:', JSON.stringify(requestData));

      const response = await axios.post<CreateRoomResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
        requestData,
        {
          headers: {
            Authorization: nickname,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('방 생성 완료:', response.data);
      router.push(`/game-room/${response.data.roomId}`);
      onSuccess();
    } catch (error) {
      console.error('API 오류:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
    } finally {
      setLoading(false);
    }
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

        {/* 비밀번호 관련 필드 제거 */}

        {/* 포맷 선택 */}
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
                  {/* <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='GENERAL' id='format-general' />
                    <Label htmlFor='format-general'>점수판 모드</Label>
                  </div> */}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* 연도 선택 - 추가된 부분 */}
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
            onClick={onSuccess}
            className='border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            취소
          </Button>
          <Button
            type='submit'
            disabled={loading}
            className='bg-blue-500 text-white hover:bg-blue-600'
          >
            {loading ? '생성 중...' : '방 생성'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
