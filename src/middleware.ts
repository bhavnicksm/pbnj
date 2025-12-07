import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Only set up SQLite database if not running on Cloudflare
  // The Cloudflare adapter automatically provides locals.runtime with D1 bindings
  if (!context.locals.runtime) {
    // Dynamically import the database module only when needed (Node.js mode)
    const { database } = await import('@/lib/db');

    context.locals.runtime = {
      env: {
        DB: database,
        AUTH_KEY: process.env.AUTH_KEY || '',
      },
    };
  }

  return next();
});
