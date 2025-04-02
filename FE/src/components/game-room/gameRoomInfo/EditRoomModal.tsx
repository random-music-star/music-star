// import { useState } from 'react';

// import { zodResolver } from '@hookform/resolvers/zod';
// import axios from 'axios';
// import { useRouter } from 'next/router';
// import { useForm } from 'react-hook-form';
// import * as z from 'zod';

// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { useNicknameStore } from '@/stores/auth/useNicknameStore';
// import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
// import {
//   AVAILABLE_MODES,
//   AVAILABLE_YEARS,
//   CreateRoomRequest,
//   CreateRoomResponse,
//   createRoomFormSchema,
// } from '@/types/rooms';

// interface CreateRoomFormProps {
//   onSuccess: () => void;
// }

// const extendedFormSchema = createRoomFormSchema;

// type ExtendedFormValues = z.infer<typeof extendedFormSchema>;

// export default function CreateRoomForm({ onSuccess }: CreateRoomFormProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const { nickname } = useNicknameStore();

//   const { gameRoomInfo } = useGameInfoStore();

//   const roomTitle = gameRoomInfo?.roomTitle || '';
//   const selectedYear = gameRoomInfo?.selectedYear || null;
//   const mode = gameRoomInfo?.mode || null;

//   const form = useForm<ExtendedFormValues>({
//     resolver: zodResolver(extendedFormSchema),
//     defaultValues: {
//       title: roomTitle || '',
//       format: 'BOARD',
//       modes: mode ? mode : [],
//       years: selectedYear ? selectedYear : [],
//     },
//   });

//   const selectedModes = form.watch('modes');
//   const selectedYears = form.watch('years');

//   const onSubmit = async (data: ExtendedFormValues) => {
//     setLoading(true);

//     const requestData: CreateRoomRequest = {
//       title: data.title,
//       password: '',
//       format: data.format,
//       gameModes: data.modes,
//       selectedYears: data.years,
//     };

//     try {
//       const response = await axios.post<CreateRoomResponse>(
//         `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
//         requestData,
//         {
//           headers: {
//             Authorization: nickname,
//             'Content-Type': 'application/json',
//           },
//         },
//       );
//       router.push(`/game/room/${response.data.roomId}`);
//       onSuccess();
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//         console.error('Response data:', error.response.data);
//         console.error('Response status:', error.response.status);
//         console.error('Response headers:', error.response.headers);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
//         <FormField
//           control={form.control}
//           name='title'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>방 이름</FormLabel>
//               <FormControl>
//                 <Input {...field} placeholder='방 이름을 입력해주세요' />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name='format'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>포맷 선택</FormLabel>
//               <FormControl>
//                 <RadioGroup
//                   value={field.value}
//                   onValueChange={field.onChange}
//                   className='flex gap-4'
//                 >
//                   <div className='flex items-center space-x-2'>
//                     <RadioGroupItem value='BOARD' id='format-board' />
//                     <Label htmlFor='format-board'>보드판 모드</Label>
//                   </div>
//                   {/* <div className='flex items-center space-x-2'>
//                     <RadioGroupItem value='GENERAL' id='format-general' />
//                     <Label htmlFor='format-general'>점수판 모드</Label>
//                   </div> */}
//                 </RadioGroup>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name='modes'
//           render={() => (
//             <FormItem>
//               <FormLabel>모드 선택</FormLabel>
//               <div className='rounded-md border p-4'>
//                 <div className='grid grid-cols-1 gap-3'>
//                   {AVAILABLE_MODES.map(mode => (
//                     <FormItem
//                       key={mode}
//                       className='flex flex-row items-start space-y-0 space-x-3'
//                     >
//                       <FormControl>
//                         <Checkbox
//                           checked={selectedModes.includes(mode)}
//                           onCheckedChange={checked => {
//                             const updatedModes = checked
//                               ? [...selectedModes, mode]
//                               : selectedModes.filter(m => m !== mode);
//                             form.setValue('modes', updatedModes);
//                             form.trigger('modes');
//                           }}
//                         />
//                       </FormControl>
//                       <FormLabel className='cursor-pointer font-normal'>
//                         {mode === 'FULL' ? '전곡 재생' : '1초 재생'}
//                       </FormLabel>
//                     </FormItem>
//                   ))}
//                 </div>
//               </div>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name='years'
//           render={() => (
//             <FormItem>
//               <FormLabel>연도 선택</FormLabel>
//               <div className='rounded-md border p-4'>
//                 <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
//                   {AVAILABLE_YEARS.map(year => (
//                     <FormItem
//                       key={year}
//                       className='flex flex-row items-start space-y-0 space-x-3'
//                     >
//                       <FormControl>
//                         <Checkbox
//                           checked={selectedYears.includes(year)}
//                           onCheckedChange={checked => {
//                             const updatedYears = checked
//                               ? [...selectedYears, year]
//                               : selectedYears.filter(y => y !== year);
//                             form.setValue('years', updatedYears);
//                             form.trigger('years');
//                           }}
//                         />
//                       </FormControl>
//                       <FormLabel className='cursor-pointer font-normal'>
//                         {year}년
//                       </FormLabel>
//                     </FormItem>
//                   ))}
//                 </div>
//               </div>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <div className='flex justify-end gap-2'>
//           <Button
//             variant='outline'
//             type='button'
//             onClick={onSuccess}
//             className='border-gray-300 text-gray-700 hover:bg-gray-100'
//           >
//             취소
//           </Button>
//           <Button
//             type='submit'
//             disabled={loading}
//             className='bg-blue-500 text-white hover:bg-blue-600'
//           >
//             {loading ? '생성 중...' : '방 생성'}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }
