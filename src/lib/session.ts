// Сессия на подписанной cookie (HMAC). Без зависимостей — Web Crypto.
// Пароль хранится как SHA-256 хэш в переменной окружения ADMIN_HASH.

const COOKIE = 'tfb_session';
const SECRET = (env?: any) => (env?.SESSION_SECRET as string) || 'change-me-session-secret';

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return b64url(hash);
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return b64url(sig);
}

export async function makeToken(secret: string): Promise<string> {
  const value = 'ok';
  const sig = await sign(value, secret);
  return `${value}.${sig}`;
}

export async function verifyToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [value, sig] = token.split('.');
  if (!value || !sig) return false;
  const expected = await sign(value, secret);
  // constant-time compare
  if (expected.length !== sig.length) return false;
  let ok = 0;
  for (let i = 0; i < expected.length; i++) ok |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return ok === 0 && value === 'ok';
}

export const SESSION_COOKIE = COOKIE;

export async function isAuthed(request: Request, env?: any): Promise<boolean> {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!m) return false;
  return verifyToken(decodeURIComponent(m[1]), SECRET(env));
}
