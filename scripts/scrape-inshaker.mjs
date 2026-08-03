// Парсит топ-N коктейлей из Inshaker и генерирует markdown.
// Запуск: node scripts/scrape-inshaker.mjs > /tmp/inshaker.md
const OZ_ML = 30;

async function fetchUrl(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
  return await res.text();
}

function parseAmount(s) {
  const m = s.match(/^([\d./]+)\s*(oz|ml|cl|tsp|tbsp|dash|pinch|cup)?\s*(.*)$/i);
  if (!m) return { amount: '', rest: s };
  let val = m[1].includes('/') ? eval(m[1]) : parseFloat(m[1]);
  let unit = (m[2] || '').toLowerCase();
  let rest = m[3].trim();
  if (unit === 'oz') return { amount: `${Math.round(val * OZ_ML)} мл`, rest };
  if (unit === 'cl') return { amount: `${Math.round(val * 10)} мл`, rest };
  if (unit === 'tsp') return { amount: `${Math.round(val * 5)} мл`, rest };
  if (unit === 'tbsp') return { amount: `${Math.round(val * 15)} мл`, rest };
  if (unit === 'dash') return { amount: `${val} дэш`, rest };
  if (unit === 'pinch') return { amount: 'щепотка', rest };
  if (unit === 'cup') return { amount: `${Math.round(val * 240)} мл`, rest };
  if (unit === 'ml') return { amount: `${val} мл`, rest };
  return { amount: m[1] + (unit ? ' ' + unit : ''), rest };
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const DICT = {
  'white rum': 'белый ром', 'dark rum': 'тёмный ром', 'aged rum': 'выдержанный ром',
  'vodka': 'водка', 'citrus vodka': 'цитрусовая водка', 'scotch whisky': 'шотландский виски',
  'bourbon': 'бурбон', 'rye whiskey': 'ржаной виски', 'gin': 'джин', 'tequila': 'текила',
  'triple sec': 'трипл-сек', 'simple syrup': 'сахарный сироп', 'lime juice': 'сок лайма',
  'lemon juice': 'сок лимона', 'cranberry juice': 'клюквенный сок', 'orange juice': 'апельсиновый сок',
  'grapefruit juice': 'грейпфрутовый сок', 'pineapple juice': 'ананасовый сок',
  'ice cubes': 'лёд в кубиках', 'egg white': 'яичный белок', 'orange zest': 'цедра апельсина',
  'lemon zest': 'цедра лимона', 'angostura bitters': 'биттер ангостура', 'soda': 'содовая',
  'cola': 'кола', 'tonic': 'тоник', 'vermouth rosso': 'красный вермут',
  'dry vermouth': 'сухой вермут', 'campari': 'кампари', 'prosecco': 'просекко',
  'red wine': 'красное вино', 'coffee liqueur': 'кофейный ликёр', 'amaretto': 'амаретто',
  'grenadine': 'гренадин', 'mint leaves': 'листья мяты', 'cointreau': 'куантро',
  'blue curacao': 'блю кюрасао', 'passion fruit': 'маракуйя', 'coconut cream': 'кокосовый крем',
  'cream': 'сливки', 'champagne': 'шампанское', 'sugar syrup': 'сахарный сироп',
  'bitters': 'биттер', 'tea flower': 'чайный цветок', 'tea flowers': 'чайные цветы', 'oolong': 'улун',
  'homemade oolong gin': 'домашний джин улун', 'grilled lemon juice': 'жареный сок лимона',
  'dried tea flowers': 'сушёные чайные цветы', 'lemon bitters': 'лимонный биттер',
  'piece': 'кусок', 'pieces': 'кусков'
};

function translate(rest) {
  let r = rest.toLowerCase().trim();
  if (DICT[r]) return DICT[r];
  for (const [en, ru] of Object.entries(DICT)) {
    if (r.includes(en)) return rest.toLowerCase().replace(en, ru);
  }
  return rest;
}

const METHOD_DICT = {
  'pour': 'Налей', 'fill': 'Наполни', 'shake': 'Встряхни', 'strain': 'Процеди',
  'stir': 'Размешай', 'add': 'Добавь', 'top': 'Долей', 'garnish': 'Укрась',
  'serve': 'Подай', 'rim': 'Натри', 'use': 'Используй', 'fine strain': 'Тонко процеди',
  'double strain': 'Дабл-стрэйн', 'chill': 'Охлади', 'crush': 'Раздроби', 'muddle': 'Разомни',
  'blend': 'Взбей в блендере', 'mix': 'Смешай', 'into a shaker': 'в шейкер',
  'into a glass': 'в бокал', 'into the glass': 'в бокал', 'with ice': 'со льдом',
  'with ice cubes': 'с кубиками льда', 'ice cubes': 'кубики льда', 'the shaker': 'шейкер',
  'a rocks glass': 'рокс', 'a cocktail glass': 'коктейльный бокал',
  'a chilled cocktail glass': 'охлаждённый коктейльный бокал', 'a champagne saucer': 'бокал для шампанского',
  'a highball glass': 'хайбол', 'a wine glass': 'винный бокал', 'and': 'и', 'of': '',
  'oz': 'унций', 'piece': 'кусок', 'dash': 'дэш', 'dashes': 'дэш', 'slice': 'долька',
  'twist': 'спираль цедры', 'zest': 'цедра', 'sprig': 'веточка', 'leaf': 'лист', 'leaves': 'листья',
  'flambée': 'опали', 'torch': 'горелка', 'oils': 'масла', 'over': 'над', 'sides': 'края',
  'then': 'затем', 'finally': 'в конце', 'gently': 'аккуратно', 'slowly': 'медленно',
  'with': 'с', 'into': 'в', 'es': '', 'a': '', 'an': '', 'finely': 'тонко', 'double': 'дабл',
  'rocks': 'рокс', 'chilled': 'охлаждённый', 'fresh': 'свежий', 'grilled': 'жареный',
  'dried': 'сушёный', 'homemade': 'домашний', 'lemon': 'лимонный', 'lime': 'лаймовый'
};

function translateMethod(text) {
  let t = text;
  // убираем дозировки (они есть в списке ингредиентов)
  t = t.replace(/\d+(\.\d+)?\s*oz/gi, '');
  t = t.replace(/\d+(\.\d+)?\s*(ml|cl|tsp|tbsp|dash|dashes|piece|pieces|cup|cups)/gi, '');
  // заменяем ингредиенты на «ингредиенты» (они уже перечислены выше)
  for (const [en] of Object.entries(DICT)) {
    const re = new RegExp('\\b' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    t = t.replace(re, 'ингредиенты');
  }
  t = t.replace(/\bingredients/gi, 'ингредиенты');
  // ключевые слова метода
  for (const [en, ru] of Object.entries(METHOD_DICT)) {
    const re = new RegExp('\\b' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    t = t.replace(re, ru);
  }
  // чистим лишнее
  t = t.replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').replace(/\s+и\s+/g, ' и ').trim();
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

async function getCocktail(slug) {
  const html = await fetchUrl(`https://inshaker.com/cocktails/${slug}`);
  const m = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(\{[\s\S]*?\})<\/script>/);
  if (!m) return null;
  let data;
  try { data = JSON.parse(m[1]); } catch { return null; }
  if (data['@type'] !== 'Recipe') return null;
  const ingredients = (data.recipeIngredient || []).map((i) => {
    const p = parseAmount(i);
    return `- ${p.amount ? p.amount + ' ' : ''}${translate(p.rest)}`;
  });
  const steps = (data.recipeInstructions || []).map((s) => (typeof s === 'string' ? s : s.text)).filter(Boolean);
  return { name: data.name, slug: slugify(data.name), ingredients, steps, desc: data.description || '' };
}

(async () => {
  const slugs = new Set();
  for (const page of [1, 2]) {
    const list = await fetchUrl(`https://inshaker.com/cocktails?page=${page}`);
    const links = [...list.matchAll(/href="(\/cocktails\/\d+-[a-z0-9-]+)"/g)].map((x) => x[1].replace('/cocktails/', ''));
    links.forEach((l) => slugs.add(l));
  }
  const list = [...slugs].slice(0, 50);
  console.error(`Parsing ${list.length} cocktails...`);
  const out = ['# Коктейли Inshaker: популярные', '', 'Подборка популярных коктейлей с сайта Inshaker (ингредиенты и метод приготовления).', ''];
  let n = 0;
  for (const slug of list) {
    const c = await getCocktail(slug);
    if (!c) continue;
    n++;
    out.push(`## ${n}. ${c.name}`);
    out.push(...c.ingredients);
    if (c.steps.length) {
      out.push('');
      out.push(`**Метод:** ` + translateMethod(c.steps.join(' ')).slice(0, 400));
    }
    out.push('');
    if (n % 10 === 0) console.error(`  ${n} done`);
  }
  console.log(out.join('\n'));
  console.error(`Total: ${n}`);
})();
