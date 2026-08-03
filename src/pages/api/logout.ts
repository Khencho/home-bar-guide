import { SESSION_COOKIE } from '../../lib/session';

export const prerender = false;

export async function GET() {
  const cookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  return new Response(null, { status: 302, headers: { Location: '/', 'Set-Cookie': cookie } });
}
