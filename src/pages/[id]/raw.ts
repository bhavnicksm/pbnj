import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  const runtime = locals.runtime as any;

  try {
    const paste = await runtime.env.DB.prepare(
      'SELECT code FROM pastes WHERE id = ?'
    ).bind(id).first();

    if (!paste) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(paste.code, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error fetching paste:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
