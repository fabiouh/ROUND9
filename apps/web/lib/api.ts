export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/r9${path}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
  }
  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: { message?: string; details?: unknown } };
  if (!res.ok) throw new ApiError(res.status, json.error?.message ?? res.statusText, json.error?.details);
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<void>('DELETE', path),
};
