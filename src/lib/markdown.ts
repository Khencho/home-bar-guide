// Markdown -> HTML через marked с превращением H2 в сворачиваемые блоки <details>.
// Повторяет логику старого rehypeChapters (аккордеон на чистом HTML/CSS, без JS).
import { Marked, type Tokens } from 'marked';

const marked = new Marked();

// Кастомный renderer: каждый H2 оборачиваем в <details><summary>...</summary>
marked.use({
  renderer: {
    heading(this: any, token: Tokens.Heading): string {
      const text = this.parser.parseInline(token.tokens);
      if (token.depth === 2) {
        return `<details class="chapter"><summary class="chapter-title">${text}</summary>\n`;
      }
      const tag = `h${token.depth}`;
      return `<${tag}>${text}</${tag}>\n`;
    },
  },
});

// Закрываем каждый <details> перед следующим или в конце.
export function renderChapters(md: string): string {
  const html = marked.parse(md || '') as string;
  const parts = html.split(/(?=<details)/);
  let out = '';
  for (const block of parts) {
    let b = block;
    if (b.startsWith('<details') && !b.trimEnd().endsWith('</details>')) {
      b = b + '</details>\n';
    }
    out += b;
  }
  return out;
}
