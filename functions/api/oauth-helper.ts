// Минимальный OAuth-хелпер для Decap CMS (GitHub backend) на Cloudflare Pages Functions.
// Переменные окружения (Pages → Settings → Functions → Variables):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

const SCOPES = 'repo,user';

export function requestOAuthHandshake(context) {
  const { env } = context;
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = new URL(context.request.url).origin + '/api/auth';
  const state = crypto.randomUUID();
  const authUrl =
    `https://github.com/login/oauth/authorize?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES)}&state=${state}`;
  return Response.redirect(authUrl, 302);
}

export async function handleAuthRedirect(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const redirectUri = url.origin + '/api/auth';
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const tokenJson = await tokenRes.json();
  const token = tokenJson.access_token;
  // Decap ждёт токен по адресу /api/auth#access_token=...
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/api/auth#access_token=${token}`,
    },
  });
}
