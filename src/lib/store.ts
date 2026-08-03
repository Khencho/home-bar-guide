// Хранилище контента через GitHub (коммит seed.ts в репозиторий).
// KV не используется — редактор пишет прямо в src/lib/seed.ts,
// Cloudflare Pages пересобирает сайт после коммита.

import { SEED } from './seed';
import type { Article } from './seed';

export type { Article };

const REPO = 'Khencho/home-bar-guide';
const PATH = 'src/lib/seed.ts';
const BRANCH = 'main';

function getToken(env?: any): string | null {
  return (env && (env.GH_TOKEN || env.GITHUB_TOKEN)) || null;
}

function sortArticles(list: Article[]): Article[] {
  return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.pubDate < b.pubDate ? 1 : -1));
}

export function getAllArticles(): Article[] {
  return sortArticles([...SEED]);
}

export function getArticle(slug: string): Article | null {
  return SEED.find((a) => a.slug === slug) || null;
}

function seedFileContent(list: Article[]): string {
  return `// Автосгенерировано из src/content/blog/*.md — fallback, если KV недоступен.\n// Не редактируй вручную.\nexport interface Article {\n  slug: string;\n  title: string;\n  description: string;\n  pubDate: string;\n  tags: string[];\n  category: string;\n  affiliate: boolean;\n  body: string;\n  pinned?: boolean;\n}\nexport const SEED: Article[] = ${JSON.stringify(sortArticles(list), null, 2)};\n`;
}

export async function saveArticle(a: Article, env?: any): Promise<void> {
  const token = getToken(env);
  if (!token) throw new Error('GH_TOKEN not set');
  const list = SEED.filter((x) => x.slug !== a.slug);
  list.push(a);
  const content = seedFileContent(list);
  // получаем текущий SHA файла
  const url = `https://api.github.com/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'tfb-admin', 'Content-Type': 'application/json' };
  const cur = await fetch(url, { headers });
  const curJson = cur.ok ? await cur.json() : null;
  const body: any = { message: `update article: ${a.slug}`, content: Buffer.from(content, 'utf8').toString('base64'), branch: BRANCH };
  if (curJson && curJson.sha) body.sha = curJson.sha;
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub commit failed: ${res.status} ${t}`);
  }
}

export async function deleteArticle(slug: string, env?: any): Promise<void> {
  const token = getToken(env);
  if (!token) throw new Error('GH_TOKEN not set');
  const list = SEED.filter((x) => x.slug !== slug);
  const content = seedFileContent(list);
  const url = `https://api.github.com/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'tfb-admin', 'Content-Type': 'application/json' };
  const cur = await fetch(url, { headers });
  if (!cur.ok) throw new Error('file not found');
  const curJson = await cur.json();
  const body = { message: `delete article: ${slug}`, content: Buffer.from(content, 'utf8').toString('base64'), branch: BRANCH, sha: curJson.sha };
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub delete failed: ${res.status} ${t}`);
  }
}
