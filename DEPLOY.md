# Деплой The Forgotten Bartender на Cloudflare Pages

Бесплатный хостинг со статикой, авто-деплоем из GitHub и SSL. Пошагово:

## 1. Домен (если ещё нет)
- Купи домен на reg.ru / timeweb / nic.ru (напр. `forgotten-bartender.ru`).
- Или используй бесплатный `*.pages.dev` от Cloudflare — для старта хватит.

## 2. Залей проект в GitHub
```bash
cd ~/Projects/home-bar-guide
git init
git add .
git commit -m "initial: The Forgotten Bartender"
gh repo create the-forgotten-bartender --private --source=. --push   # требует gh auth login
```
Если нет `gh`: создай репо на github.com вручную и `git remote add origin <url> && git push -u origin main`.

## 3. Cloudflare Pages
1. Зайди на dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Выбери репозиторий `the-forgotten-bartender`.
3. Настройки сборки:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy**. Через ~1 минуту сайт на `*.pages.dev`.

## 4. Привяжи свой домен
- В настройках проекта → **Custom domains** → добавь свой домен.
- Cloudflare даст NS-записи — пропиши их у регистратора.
- В `astro.config.mjs` смени `site: 'https://dombar.example.ru'` на `https://твой-домен.ru` и запуши.

## 5. Отдай sitemap поисковикам
- **Яндекс.Вебмастер** (важнее для RuNet): добавь сайт, подтверди, укажи `https://твой-домен.ru/sitemap-index.xml`.
- **Google Search Console**: аналогично.
- Статьи индексируются 1–4 недели.

## 6. Монетизация
- **Ozon для блогеров:** https://www.ozon.ru/info/blogger/ — получи партнёрские ссылки, вставь в статьи (см. шаблон в README).
- **AliExpress affiliate:** присоединись, замени плейсхолдеры `?utm_source=dombar` на свои трек-ссылки.
- **РСЯ (Яндекс):** подключи, когда наберётся стабильный трафик и ~20+ качественных страниц.

## 7. Контент-цикл
Публикуй 2–4 статьи в неделю кластерами (инвентарь / кофе / безалко). Каждую новую статью — `git add` + `commit` + `push`, Cloudflare пересобирает сам.
