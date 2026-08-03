// Генератор src/lib/seed.ts из существующих .md (fallback контента, если KV пуст).
// Запуск: node scripts/gen-seed.mjs
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const dir = path.resolve('src/content/blog');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
const out = [];
for (const f of files) {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8');
  const { data, content } = matter(raw);
  const slug = f.replace(/\.md$/, '');
  const pubDate = data.pubDate instanceof Date ? data.pubDate.toISOString().slice(0, 10) : String(data.pubDate || '').slice(0, 10);
  out.push({
    slug,
    title: data.title || slug,
    description: data.description || '',
    pubDate,
    tags: data.tags || [],
    category: data.category || 'Статьи',
    affiliate: !!data.affiliate,
    body: content.trim(),
  });
}
const body = `// Автосгенерировано из src/content/blog/*.md — fallback, если KV недоступен.
// Не редактируй вручную.
export const SEED: Article[] = ${JSON.stringify(out, null, 2)};
`;
fs.writeFileSync(path.resolve('src/lib/seed.ts'), body);
console.log('Сгенерировано статей:', out.length);
