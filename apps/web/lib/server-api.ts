import 'server-only';
import { auth0 } from './auth0';
import type { Me } from './types';

/** Server Component fetch against the ROUND9 API with the session's access token. */
export async function serverApi<T>(path: string): Promise<T | null> {
  const session = await auth0.getSession();
  if (!session) return null;
  const { token } = await auth0.getAccessToken();
  const res = await fetch(`${process.env.API_URL}${path}`, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${path} failed with ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

export const getMe = () => serverApi<Me>('/users/me');
