import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const runtime = locals.runtime as any;

    const cursor = parseInt(url.searchParams.get('cursor') || '0');
    const limit = 20;

    const { results } = await runtime.env.DB.prepare(
      'SELECT id, language, created, SUBSTR(code, 1, 200) as preview FROM pastes ORDER BY created DESC LIMIT ? OFFSET ?'
    )
      .bind(limit, cursor)
      .all();

    return new Response(
      JSON.stringify({
        pastes: results,
        nextCursor: results.length === limit ? cursor + limit : null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching pastes:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
