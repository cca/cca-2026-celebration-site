import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const env = import.meta.env.PUBLIC_ENV;

  if (env !== 'production' && env !== 'staging') {
    throw new Error(
      `PUBLIC_ENV must be "production" or "staging", got: ${JSON.stringify(env)}. ` +
      `Set _ENV in the Cloud Build trigger substitution variables.`
    );
  }

  const body =
    env === 'staging'
      ? `User-agent: *\nDisallow: /\n`
      : `User-agent: *\nDisallow: /docs/\nDisallow: /demo/\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
