import { useChannelStore } from '@/stores/lobby/useChannelStore';
import { RoomFormValues } from '@/types/rooms';
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
  format?: string;
  gameModes: string[];
  selectedYears: number[];
  roomId?: number; // 방 수정하기 요청에서만 사용
  channelId?: number; // 방 생성하기 요청에서만 사용
}

// 소켓 데이터를 폼 데이터로 변환 (GameInfoState -> FormValues)
export function socketToFormData(
  gameRoomInfo: GameRoomInfo | null,
): Partial<RoomFormValues> | null {
  if (!gameRoomInfo) return null;

  const formData = {
    title: gameRoomInfo.roomTitle || '',
    format: gameRoomInfo.format || 'BOARD',
    modes: (gameRoomInfo.mode || []).map((m: Mode) => m),
    years: gameRoomInfo.selectedYear || [],
    hasPassword: gameRoomInfo.hasPassword || false,
    password: '', // 서버에서는 비밀번호를 반환하지 않으므로 빈 문자열로 초기화
  };

  console.log('소켓 데이터를 폼 데이터로 변환:', {
    원본_게임방정보: gameRoomInfo,
    변환된_폼데이터: formData,
  });

  return formData;
}

// 폼 데이터를 API 요청 데이터로 변환 (FormValues -> API Request)
export function formToApiData(
  formData: RoomFormValues,
  roomId?: string,
): ApiRequestData {
  const password = formData.hasPassword ? formData.password : '';
  const currentChannelId = useChannelStore.getState().currentChannelId;

  if (roomId) {
    // 방 수정하기 요청 - API 명세에 맞게 구성
    const data = {
      roomId: Number(roomId),
      title: formData.title,
      password: password,
      gameModes: formData.modes || [],
      selectedYears: formData.years || [],
      format: formData.format, // request에서 삭제되면 제거 필요
    };

    return data;
  } else {
    // 방 생성하기 요청
    const data = {
      channelId: currentChannelId ?? 1,
      title: formData.title,
      password: password,
      format: formData.format,
      gameModes: formData.modes || [],
      selectedYears: formData.years || [],
    };

    console.log('폼 데이터를 API 요청 데이터로 변환:', {
      원본_폼데이터: formData,
      변환된_요청데이터: data,
    });

    return data;
  }
}
