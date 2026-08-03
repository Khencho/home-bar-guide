import { requestOAuthHandshake, handleAuthRedirect } from './oauth-helper';

export const onRequest = async (context) => {
  const url = new URL(context.request.url);
  if (url.searchParams.get('code')) {
    return handleAuthRedirect(context);
  }
  return requestOAuthHandshake(context);
};
