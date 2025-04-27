import {
  getCookie as getClientCookie,
  getCookie as getServerCookie,
} from 'cookies-next';
import type { NextApiRequest, NextApiResponse } from 'next';

export const COOKIE_NAME = 'accessToken';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export type ApiContext = {
  req: NextApiRequest;
  res: NextApiResponse;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
};

type ApiFail = {
  success: false;
  data: null;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFail;

export async function api<T>(
  path: string,
  init?: RequestInit,
  ctx?: ApiContext,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;

  const cookieValue = ctx
    ? ((await getServerCookie(COOKIE_NAME, {
        req: ctx.req,
        res: ctx.res,
      })) as string)
    : ((await getClientCookie(COOKIE_NAME)) as string);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(cookieValue && { Authorization: 'Bearer ' + cookieValue }),
    ...(init?.headers as Record<string, string>),
  };

  console.log('headers:', headers);

  const res = await fetch(url, { ...init, headers });
  const data = await res.json();

  if (!res.ok) {
    return {
      data: null,
      success: false,
      error: data.message || res.statusText,
    };
  }

  return {
    data: data as T,
    success: true,
    error: null,
  };
}
