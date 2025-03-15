import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

interface CreateRoomFormProps {
  onSuccess: () => void;
}

// API 요청 및 응답 타입 정의
interface CreateRoomRequest {
  title: string;
  password: string;
  format: string;
  gameModes: string[];
}

interface CreateRoomResponse {
  roomId: number;
}

// Zod 스키마 정의 (superRefine 사용)
const formSchema = z
  .object({
    title: z.string().min(1, '방 이름을 설정해주세요'),
    isLocked: z.boolean().default(false),
    password: z.string().optional(),
    format: z.string().min(1, '포맷을 선택해주세요'),
    modes: z.array(z.string()).min(1, '모드는 최소 한 개 이상 선택해야 합니다'),
  })
  .superRefine((data, ctx) => {
    if (data.isLocked && (!data.password || data.password.length === 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: '비밀번호를 설정해주세요',
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export default function CreateRoomForm({ onSuccess }: CreateRoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { nickname } = useNicknameStore();

  // React Hook Form 설정
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      isLocked: false,
      password: '',
      format: '',
      modes: [],
    },
  });

  // 폼 상태 가져오기
  const isLocked = form.watch('isLocked');
  const selectedModes = form.watch('modes');

  // 모드 선택 핸들러 (불필요한 리렌더링 방지)
  const handleModeSelect = (mode: string) => {
    if (!selectedModes.includes(mode)) {
      form.setValue('modes', [...selectedModes, mode]);
      form.trigger('modes');
    }
  };

  // 모드 제거 핸들러
  const removeMode = (mode: string) => {
    form.setValue(
      'modes',
      selectedModes.filter(m => m !== mode),
    );
    form.trigger('modes');
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    const requestData: CreateRoomRequest = {
      title: data.title,
      password: data.isLocked ? data.password || '' : '',
      format: data.format,
      gameModes: data.modes,
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
      const roomId = response.data.roomId;
      router.push(`/game-room?roomId=${roomId}`);
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

        {/* 잠금방 설정 */}
        <FormField
          control={form.control}
          name='isLocked'
          render={({ field }) => (
            <FormItem className='flex justify-between items-center'>
              <FormLabel>잠금방 설정</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={checked => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue('password', '');
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 비밀번호 입력 */}
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={!isLocked}
                  placeholder='비밀번호 입력'
                  className={!isLocked ? 'bg-gray-100 text-gray-400' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  {/* <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GENERAL" id="format-general" />
                    <Label htmlFor="format-general">점수판 모드</Label>
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
              <div className='flex justify-between items-center'>
                <FormLabel>모드 선택</FormLabel>
                <Select onValueChange={handleModeSelect}>
                  <SelectTrigger className='w-auto min-w-[120px]'>
                    <SelectValue placeholder='모드 추가' />
                  </SelectTrigger>
                  <SelectContent>
                    {['FULL'] // "1SEC"
                      .filter(mode => !selectedModes.includes(mode))
                      .map(mode => (
                        <SelectItem key={mode} value={mode}>
                          {mode === 'FULL' ? '전곡 재생' : '1초 재생'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedModes.length === 0 ? (
                <div className='border border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500 mt-2'>
                  모드를 선택해주세요
                </div>
              ) : (
                <div className='flex flex-wrap gap-2 mt-2'>
                  {selectedModes.map(mode => (
                    <Badge
                      key={mode}
                      variant='secondary'
                      className='pl-2 pr-1 py-1 bg-gray-200 text-gray-700'
                    >
                      {mode === 'FULL' ? '전곡 재생' : '1초 재생'}
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='h-5 px-1 ml-1 text-gray-500 hover:text-gray-800'
                        onClick={() => removeMode(mode)}
                      >
                        삭제
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
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
            className='bg-blue-500 hover:bg-blue-600 text-white'
          >
            {loading ? '생성 중...' : '방 생성'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
