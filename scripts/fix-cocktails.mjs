// 1) Переносит статьи-разборы из «Коктейли» в «Статьи».
// 2) Приводит первое слово каждого H2 к заглавной букве.
// Запуск: node scripts/fix-cocktails.mjs
import fs from 'node:fs';
import path from 'node:path';

const seedPath = path.resolve('src/lib/seed.ts');
let seed = fs.readFileSync(seedPath, 'utf8');
const start = seed.indexOf('= [');
const end = seed.lastIndexOf('];');
const arrText = seed.slice(start + 2, end + 1);
const current = JSON.parse(arrText);

const KEEP_IN_COCKTAILS = new Set([
  'inshaker-kokteyli',
  'esenin-kokteyli',
  'sindikat-kokteyli',
  'klassicheskie-kokteyli'
]);

function capitalizeH2(body) {
  return body.replace(/^##\s+(.+)$/gm, (m, title) => {
    const t = title.trim();
    const fixed = t.charAt(0).toUpperCase() + t.slice(1);
    return '## ' + fixed;
  });
}

let moved = 0;
for (const a of current) {
  if (a.category === 'Коктейли' && !KEEP_IN_COCKTAILS.has(a.slug)) {
    a.category = 'Статьи';
    moved++;
    console.log('→ Статьи:', a.slug);
  }
  a.body = capitalizeH2(a.body);
}

const sorted = [...current].sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.pubDate < b.pubDate ? 1 : -1));
const newContent = `// Автосгенерировано из src/content/blog/*.md — fallback, если KV недоступен.\n// Не редактируй вручную.\nexport interface Article {\n  slug: string;\n  title: string;\n  description: string;\n  pubDate: string;\n  tags: string[];\n  category: string;\n  affiliate: boolean;\n  body: string;\n  pinned?: boolean;\n}\nexport const SEED: Article[] = ${JSON.stringify(sorted, null, 2)};\n`;
fs.writeFileSync(seedPath, newContent);
console.log(`Перенесено в «Статьи»: ${moved}. H2 приведены к заглавной.`);
