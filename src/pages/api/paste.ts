import type { APIRoute } from 'astro';

// Generate random 8-character ID
function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get runtime from Astro locals (Cloudflare binding)
    const runtime = locals.runtime as any;

    // Check authentication
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Bearer ${runtime.env.AUTH_KEY}`;

    if (authHeader !== expectedAuth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await request.json();
    const { code, language } = body;

    if (!code) {
      return new Response(JSON.stringify({ error: 'Code is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate ID and insert into database
    const id = generateId();
    const created = Date.now();

    await runtime.env.DB.prepare(
      'INSERT INTO pastes (id, code, language, created) VALUES (?, ?, ?, ?)'
    )
      .bind(id, code, language || 'txt', created)
      .run();

    // Return success response
    const url = `${new URL(request.url).origin}/${id}`;

    return new Response(
      JSON.stringify({
        id,
        url,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating paste:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
