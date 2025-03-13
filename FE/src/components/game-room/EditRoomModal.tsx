import { useState } from 'react';
import { Room } from '../../_types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: Room;
}

// 게임 연도 옵션
const GAME_YEARS = ['20년', '21년', '22년', '23년'];

// 게임 모드 옵션
const GAME_MODES = ['한곡', '도입부', 'AI생성', '역순', '2배속'];

export default function EditRoomModal({
  isOpen,
  onClose,
  roomData,
}: EditRoomModalProps) {
  const [formData, setFormData] = useState<Room>({ ...roomData });
  const [selectedYears, setSelectedYears] = useState<string[]>(
    roomData.gameYears,
  );
  const [selectedModes, setSelectedModes] = useState<string[]>(
    roomData.gameModes,
  );

  const handleChange = (field: keyof Room, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleYearToggle = (year: string) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year],
    );
  };

  const handleModeToggle = (mode: string) => {
    setSelectedModes(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode],
    );
  };

  const handleSubmit = () => {
    const updatedRoomData = {
      ...formData,
      gameYears: selectedYears,
      gameModes: selectedModes,
    };

    console.log('업데이트된 방 정보:', updatedRoomData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-center'>
            방 설정 수정
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='room-name' className='text-right'>
              방 이름
            </Label>
            <Input
              id='room-name'
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className='col-span-3'
            />
          </div>

          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='private-room' className='text-right'>
              비공개 방
            </Label>
            <div className='col-span-3 flex items-center gap-2'>
              <Switch
                id='private-room'
                checked={formData.isPrivate}
                onCheckedChange={checked => handleChange('isPrivate', checked)}
              />
              <span className='text-sm text-gray-500'>
                {formData.isPrivate
                  ? '참가자는 방 코드가 필요합니다'
                  : '누구나 입장할 수 있습니다'}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='max-players' className='text-right'>
              최대 인원
            </Label>
            <Select
              value={formData.maxPlayers.toString()}
              onValueChange={value =>
                handleChange('maxPlayers', parseInt(value))
              }
            >
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='최대 인원 선택' />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}명
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-4 items-start gap-4'>
            <Label className='text-right pt-2'>게임 연도</Label>
            <div className='col-span-3 space-y-2'>
              <div className='flex flex-wrap gap-3'>
                {GAME_YEARS.map(year => (
                  <div key={year} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`year-${year}`}
                      checked={selectedYears.includes(year)}
                      onCheckedChange={() => handleYearToggle(year)}
                    />
                    <Label
                      htmlFor={`year-${year}`}
                      className='text-sm font-medium cursor-pointer'
                    >
                      {year}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedYears.length === 0 && (
                <p className='text-sm text-red-500'>
                  최소 하나의 연도를 선택해주세요
                </p>
              )}
            </div>
          </div>

          {/* 게임 모드 - 다중 선택 */}
          <div className='grid grid-cols-4 items-start gap-4'>
            <Label className='text-right pt-2'>게임 모드</Label>
            <div className='col-span-3 space-y-2'>
              <div className='flex flex-wrap gap-3'>
                {GAME_MODES.map(mode => (
                  <div key={mode} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`mode-${mode}`}
                      checked={selectedModes.includes(mode)}
                      onCheckedChange={() => handleModeToggle(mode)}
                    />
                    <Label
                      htmlFor={`mode-${mode}`}
                      className='text-sm font-medium cursor-pointer'
                    >
                      {mode}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedModes.length === 0 && (
                <p className='text-sm text-red-500'>
                  최소 하나의 모드를 선택해주세요
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className='bg-indigo-600 hover:bg-indigo-700'
            disabled={selectedYears.length === 0 || selectedModes.length === 0}
          >
            저장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
