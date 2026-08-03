// Клиентский поиск по статьям (SEED). Поля: title, description, tags, category, body.
import { SEED } from './seed';

export interface SearchResult {
  slug: string;
  title: string;
  category: string;
  description: string;
  snippet: string;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeSnippet(body: string, q: string): string {
  const norm = normalize(body);
  const idx = norm.indexOf(q);
  if (idx === -1) return body.slice(0, 120).replace(/\n/g, ' ') + '…';
  const start = Math.max(0, idx - 60);
  const end = Math.min(body.length, idx + q.length + 80);
  return (start > 0 ? '…' : '') + body.slice(start, end).replace(/\n/g, ' ') + (end < body.length ? '…' : '');
}

export function search(query: string, limit = 12): SearchResult[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const terms = q.split(' ').filter(Boolean);
  const results: SearchResult[] = [];
  for (const a of SEED) {
    const hay = normalize(`${a.title} ${a.description} ${a.tags.join(' ')} ${a.category} ${a.body}`);
    // все термины должны присутствовать
    const matches = terms.every((t) => hay.includes(t));
    if (!matches) continue;
    // приоритет: заголовок/теги совпадают сильнее
    const titleHit = normalize(a.title).includes(q);
    const tagHit = a.tags.some((t) => normalize(t).includes(q));
    results.push({
      slug: a.slug,
      title: a.title,
      category: a.category,
      description: a.description,
      snippet: makeSnippet(a.body, q),
    });
    (results[results.length - 1] as any)._score = (titleHit ? 100 : 0) + (tagHit ? 50 : 0);
  }
  results.sort((x, y) => ((y as any)._score || 0) - ((x as any)._score || 0));
  return results.slice(0, limit);
}
