// Возвращает Метод и Посуду в статью про коктейли Синдикат. Запуск: node scripts/restore-method.mjs
import fs from 'node:fs';
import path from 'node:path';

const seedPath = path.resolve('src/lib/seed.ts');
let seed = fs.readFileSync(seedPath, 'utf8');
const start = seed.indexOf('= [');
const end = seed.lastIndexOf('];');
const arrText = seed.slice(start + 2, end + 1);
const current = JSON.parse(arrText);

const BODY = `Карта авторских коктейлей бара «Синдикат» — состав, метод приготовления и подача в посуде.

## Зелёное алиби
- П/Ф «Огурец-базилик» — 100 мл
- Ликёр Мараскино — 20 мл
- Яичный белок — 20 мл
- **Метод:** шейк, дабл-стрэйн. **Посуда:** шале.

## Омерта клаб
- П/Ф «Копчёная груша» — 80 мл
- П/Ф «Виски-масло» — 40 мл
- **Метод:** стир. **Посуда:** ребристый рокс с глыбой.

## Томми-Ганн сауэр
- П/Ф «Милк-панч с яблоком и карамелью» — 110 мл
- Пена «Карамель-миндаль» — 40 мл
- **Метод:** стир. **Посуда:** тонкий рокс с глыбой.

## Звонок от Дона
- Виски хаус — 50 мл
- Херес Пэдро Хименес — 50 мл
- П/Ф «Сироп Корица» — 20 мл
- Лимонная кислота — 20 мл
- **Метод:** шейк, дабл-стрэйн. **Посуда:** ребристый рокс с глыбой.

## Крёстный отец
- Настойка «Виски-вишня» — 50 мл
- Вишнёвый сок — 50 мл
- Сироп «Корица» — 20 мл
- Лимонная кислота — 20 мл
- **Метод:** шейк, дабл-стрэйн. **Посуда:** ребристый рокс с глыбой.

## Малиновый пиджак
- Милк-панч «Малина-шоколад» — 100 мл

## Бригадирша
- П/Ф «Клюква-маракуйя» — 50 мл
- Водка Хаус — 40 мл
- Яичный белок — 30 мл
- **Метод:** шейк, дабл-стрэйн. **Посуда:** шале.

## Синатра Спритц
- Джин Хаус — 50 мл
- Пюре маракуйя — 50 мл
- Сахарный сироп — 20 мл
- Игристое вино — 70 мл
- **Метод:** шейк, дабл-стрэйн. **Посуда:** винный бокал.`;

let n = 0;
for (const a of current) {
  if (a.slug === 'sindikat-kokteyli') {
    a.body = BODY;
    n++;
    console.log('updated', a.slug);
  }
}

const sorted = [...current].sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.pubDate < b.pubDate ? 1 : -1));
const newContent = `// Автосгенерировано из src/content/blog/*.md — fallback, если KV недоступен.\n// Не редактируй вручную.\nexport interface Article {\n  slug: string;\n  title: string;\n  description: string;\n  pubDate: string;\n  tags: string[];\n  category: string;\n  affiliate: boolean;\n  body: string;\n  pinned?: boolean;\n}\nexport const SEED: Article[] = ${JSON.stringify(sorted, null, 2)};\n`;
fs.writeFileSync(seedPath, newContent);
console.log(`Исправлено статей: ${n}`);
