import { isAuthed } from '../../lib/session';
import { saveArticle, deleteArticle, type Article } from '../../lib/store';

export const prerender = false;

export async function POST({ request, locals }: any) {
  const env = locals?.runtime?.env;
  if (!(await isAuthed(request, env))) {
    return new Response(null, { status: 302, headers: { Location: '/login' } });
  }
  const form = await request.formData();
  const action = String(form.get('action') || 'save');
  const originalSlug = String(form.get('originalSlug') || '');
  const slug = String(form.get('slug') || '').trim();
  const title = String(form.get('title') || '').trim();

  if (action === 'delete') {
    if (originalSlug) await deleteArticle(originalSlug, env);
    return new Response(null, { status: 302, headers: { Location: '/admin' } });
  }

  if (!slug || !title) {
    return new Response('slug and title required', { status: 400 });
  }

  const tags = String(form.get('tags') || '')
    .split(',').map((t) => t.trim()).filter(Boolean);

  const article: Article = {
    slug,
    title,
    description: String(form.get('description') || '').trim(),
    pubDate: String(form.get('pubDate') || new Date().toISOString().slice(0, 10)),
    tags,
    category: String(form.get('category') || 'Статьи'),
    affiliate: form.get('affiliate') === 'on',
    body: String(form.get('body') || ''),
  };

  try {
    await saveArticle(article, env);
  } catch (e: any) {
    return new Response('Ошибка сохранения: ' + e.message, { status: 500 });
  }
  return new Response(null, { status: 302, headers: { Location: `/admin?edit=${slug}` } });
}
