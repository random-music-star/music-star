// lib/api.ts
import {
  getCookie as getClientCookie,
  getCookie as getServerCookie,
} from 'cookies-next';
import type { NextApiRequest, NextApiResponse } from 'next';

const COOKIE_NAME = 'accessToken';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export type ApiContext = {
  req: NextApiRequest;
  res: NextApiResponse;
};

export async function api<T>(
  path: string,
  init?: RequestInit,
  ctx?: ApiContext,
): Promise<T> {
  const url = `${BASE_URL}/${path}`;

  const cookieValue = ctx
    ? (getServerCookie(COOKIE_NAME, { req: ctx.req, res: ctx.res }) as string)
    : (getClientCookie(COOKIE_NAME) as string);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(cookieValue && { cookie: cookieValue }),
    ...(init?.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...init, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data as T;
}
