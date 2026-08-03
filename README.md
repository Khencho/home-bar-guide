# The Forgotten Bartender

Статический сайт (Astro) про домашний бар и напитки. Деплой на Cloudflare Pages.

## Редактирование контента

Зайди на `https://<твой-домен>/admin` → логин через GitHub → редактируй статьи.
После сохранения сайт пересобирается автоматически (GitHub Actions → Cloudflare Pages).

## Локальная разработка

```
npm install
npm run dev      # http://localhost:4321
npm run build    # сборка в dist/
```

## Ручной деплой

```
CLOUDFLARE_API_TOKEN=*** CLOUDFLARE_ACCOUNT_ID=*** \
  npx wrangler pages deploy dist --project-name=the-forgotten-bartender --branch=main
```
