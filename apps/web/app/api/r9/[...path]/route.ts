import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';

/**
 * Browser → ROUND9 API bridge. The access token never leaves the server;
 * the API derives the user from the verified token, never from the request body.
 */
async function forward(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: { statusCode: 401, message: 'Not signed in' } }, { status: 401 });

  let token: string;
  try {
    ({ token } = await auth0.getAccessToken());
  } catch {
    return NextResponse.json({ error: { statusCode: 401, message: 'Session expired' } }, { status: 401 });
  }

  const { path } = await params;
  const url = `${process.env.API_URL}/${path.map(encodeURIComponent).join('/')}${req.nextUrl.search}`;
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text();
  const res = await fetch(url, {
    method: req.method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'accept-language': req.headers.get('accept-language') ?? '' },
    body: body || undefined,
    cache: 'no-store',
  });
  return new NextResponse(res.status === 204 ? null : await res.text(), {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
