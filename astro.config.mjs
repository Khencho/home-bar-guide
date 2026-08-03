// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Превращает каждый H2-раздел статьи в сворачиваемую главу <details>/<summary>
// Работает на этапе сборки — аккордеон уже в готовом HTML, без клиентского JS.
function rehypeChapters() {
  return (tree) => {
    const out = [];
    let current = null;
    for (const node of tree.children) {
      const isH2 = node.type === 'element' && node.tagName === 'h2';
      if (isH2) {
        const summary = {
          type: 'element',
          tagName: 'summary',
          properties: { className: ['chapter-title'] },
          children: node.children,
        };
        current = {
          type: 'element',
          tagName: 'details',
          properties: { className: ['chapter'] },
          children: [summary],
        };
        out.push(current);
      } else if (current) {
        current.children.push(node);
      } else {
        out.push(node);
      }
    }
    tree.children = out;
  };
}

// Замени на свой реальный домен перед деплоем!
export default defineConfig({
  site: 'https://the-forgotten-bartender.pages.dev',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
    rehypePlugins: [rehypeChapters],
  },
  // Чистые URL без слэша в конце — дружелюбно к Яндексу/Гуглу
  trailingSlash: 'never',
});
