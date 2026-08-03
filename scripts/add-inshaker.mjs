// Читает /tmp/inshaker.md и добавляет статью в seed.ts. Запуск: node scripts/add-inshaker.mjs
import fs from 'node:fs';
import path from 'node:path';

const md = fs.readFileSync('/tmp/inshaker.md', 'utf8');
const seedPath = path.resolve('src/lib/seed.ts');
let seed = fs.readFileSync(seedPath, 'utf8');
const start = seed.indexOf('= [');
const end = seed.lastIndexOf('];');
const arrText = seed.slice(start + 2, end + 1);
const current = JSON.parse(arrText);
const existing = new Set(current.map((a) => a.slug));

// парсим markdown: заголовок H1, затем H2 блоки
const lines = md.split('\n');
let body = '';
let count = 0;
for (const line of lines) {
  if (line.startsWith('## ')) {
    body += '\n' + line.replace('## ', '## ') + '\n';
    count++;
  } else if (line.startsWith('- ') || line.startsWith('**Метод')) {
    body += line + '\n';
  }
}
body = body.trim();

const ARTICLE = {
  slug: 'inshaker-kokteyli',
  title: 'Коктейли Inshaker: популярные',
  description: 'Подборка популярных коктейлей с сайта Inshaker: ингредиенты и метод приготовления.',
  pubDate: '2026-08-03',
  tags: ['коктейли', 'inshaker', 'популярные', 'рецепты'],
  category: 'Коктейли',
  affiliate: false,
  body
};

let added = 0;
if (!existing.has(ARTICLE.slug)) {
  current.push(ARTICLE);
  added++;
  console.log('+', ARTICLE.slug);
} else {
  // обновим
  const idx = current.findIndex((a) => a.slug === ARTICLE.slug);
  current[idx] = ARTICLE;
  console.log('~ updated', ARTICLE.slug);
}

const sorted = [...current].sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.pubDate < b.pubDate ? 1 : -1));
const newContent = `// Автосгенерировано из src/content/blog/*.md — fallback, если KV недоступен.\n// Не редактируй вручную.\nexport interface Article {\n  slug: string;\n  title: string;\n  description: string;\n  pubDate: string;\n  tags: string[];\n  category: string;\n  affiliate: boolean;\n  body: string;\n  pinned?: boolean;\n}\nexport const SEED: Article[] = ${JSON.stringify(sorted, null, 2)};\n`;
fs.writeFileSync(seedPath, newContent);
console.log(`Коктейлей в статье: ${count}. Всего в SEED: ${sorted.length}`);
