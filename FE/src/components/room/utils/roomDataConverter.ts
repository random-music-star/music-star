import { CreateRoomFormValues } from '@/types/rooms';
import { Mode } from '@/types/websocket';

/**
 * GameRoomInfo 인터페이스 정의
 */
interface GameRoomInfo {
  roomTitle?: string;
  format?: 'GENERAL' | 'BOARD';
  mode?: Mode[];
  selectedYear?: number[];
  hasPassword?: boolean;
}

/**
 * API 요청 데이터 인터페이스
 */
interface ApiRequestData {
  title: string;
  password: string;
  format: string;
  gameModes: string[];
  selectedYears: number[];
  roomId?: string;
}

// 소켓 데이터를 폼 데이터로 변환 (GameInfoState -> FormValues)
export function socketToFormData(
  gameRoomInfo: GameRoomInfo | null,
): Partial<CreateRoomFormValues> | null {
  if (!gameRoomInfo) return null;

  const formData = {
    title: gameRoomInfo.roomTitle || '',
    format: gameRoomInfo.format || 'BOARD',
    // 소켓에서는 'ONE_SEC', 폼에서는 '1SEC' 사용
    modes: (gameRoomInfo.mode || []).map((m: Mode) =>
      m === 'ONE_SEC' ? '1SEC' : m,
    ),
    years: gameRoomInfo.selectedYear || [],
  };

  console.log('소켓 데이터를 폼 데이터로 변환:', {
    원본_게임방정보: gameRoomInfo,
    변환된_폼데이터: formData,
  });

  return formData;
}

// 폼 데이터를 API 요청 데이터로 변환 (FormValues -> API Request)
export function formToApiData(
  formData: CreateRoomFormValues,
  roomId?: string,
): ApiRequestData {
  const data: Omit<ApiRequestData, 'roomId'> = {
    title: formData.title,
    password: '', // 빈 문자열로 설정
    format: formData.format,
    gameModes: (formData.modes || []).map((m: string) =>
      m === '1SEC' ? 'ONE_SEC' : m,
    ),
    selectedYears: formData.years || [],
  };

  const requestData = roomId ? { ...data, roomId } : data;

  console.log('폼 데이터를 API 요청 데이터로 변환:', {
    원본_폼데이터: formData,
    roomId: roomId,
    변환된_요청데이터: requestData,
  });

  return requestData;
}
