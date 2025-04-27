import { UserCredentials } from '@/hooks/useAuth';

import { ApiContext, api } from './core';

export const guestLoginAPI = (ctx?: ApiContext) =>
  api<{ accessToken: string }>('/auth/guest', { method: 'GET' }, ctx);

export const userLoginAPI = (loginForm: UserCredentials, ctx?: ApiContext) =>
  api<{ accessToken: string }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(loginForm) },
    ctx,
  );

export const userSignupAPI = (loginForm: UserCredentials, ctx?: ApiContext) =>
  api<{ accessToken: string }>(
    '/auth/signup',
    { method: 'POST', body: JSON.stringify(loginForm) },
    ctx,
  );
