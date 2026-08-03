import { sha256, makeToken, SESSION_COOKIE } from '../../lib/session';

export const prerender = false;

export async function POST({ request, locals }: any) {
  const env = locals?.runtime?.env;
  const form = await request.formData();
  const username = String(form.get('username') || '');
  const password = String(form.get('password') || '');

  const adminUser = env?.ADMIN_USER || 'admin';
  const adminHash = env?.ADMIN_HASH || '';
  const userHash = await sha256(username + ':' + password);

  if (username !== adminUser || userHash !== adminHash) {
    return new Response(null, { status: 302, headers: { Location: '/login?error=1' } });
  }

  const token = await makeToken(env?.SESSION_SECRET || 'change-me');
  const cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;
  return new Response(null, { status: 302, headers: { Location: '/admin', 'Set-Cookie': cookie } });
}
