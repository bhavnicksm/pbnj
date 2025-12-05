import type { APIRoute } from 'astro';
import { generateId } from '@/lib/id';
import config, { parseSize } from '@/lib/config';

// Detect language from filename extension
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sql': 'sql',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
  };
  return languageMap[ext || ''] || 'plaintext';
}

// Generate a random secret key for private pastes
function generateSecretKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if error is a unique constraint violation
function isUniqueConstraintError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('UNIQUE constraint failed') ||
           error.message.includes('duplicate key');
  }
  return false;
}

// Generate unique snippet filename
async function generateSnippetFilename(db: any): Promise<string> {
  // Count existing snippets to determine the next number
  const result = await db.prepare(
    `SELECT COUNT(*) as count FROM pastes WHERE filename = 'snippet' OR filename LIKE 'snippet #%'`
  ).first();

  const count = result?.count || 0;

  if (count === 0) {
    return 'snippet';
  }

  return `snippet #${count + 1}`;
}

// GET /api - List pastes
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const runtime = locals.runtime as any;

    const cursor = parseInt(url.searchParams.get('cursor') || '0');
    const limit = 20;
    const sortDirection = config.sortOrder === 'oldest' ? 'ASC' : 'DESC';

    const { results } = await runtime.env.DB.prepare(
      `SELECT id, language, updated, filename, SUBSTR(code, 1, 200) as preview FROM pastes WHERE is_private = 0 OR is_private IS NULL ORDER BY updated ${sortDirection} LIMIT ? OFFSET ?`
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

// DELETE /api - Delete all pastes (requires auth)
export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
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

    // Delete all pastes
    await runtime.env.DB.prepare('DELETE FROM pastes').run();

    return new Response(
      JSON.stringify({ message: 'All pastes deleted' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error deleting pastes:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST /api - Create paste
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

    let code: string;
    let language: string | undefined;
    let filename: string | undefined;
    let isPrivate = false;
    let secretKey: string | null = null;

    // Check content type to determine how to parse the request
    const contentType = request.headers.get('Content-Type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle form data (file upload)
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return new Response(JSON.stringify({ error: 'File is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Read file content
      code = await file.text();
      filename = file.name;

      // Detect language from filename or use provided language
      const providedLanguage = formData.get('language') as string | null;
      language = providedLanguage || detectLanguage(file.name);

      // Handle private flag and key
      isPrivate = formData.get('private') === 'true';
      const keyParam = formData.get('key') as string | null;
      if (keyParam) {
        secretKey = keyParam === 'true' ? generateSecretKey() : keyParam;
        isPrivate = true; // If key is provided, paste is automatically private
      }
    } else if (contentType.includes('application/json')) {
      // Handle JSON (original format)
      const body = await request.json();
      code = body.code;
      language = body.language;
      filename = body.filename;
      isPrivate = body.private === true;

      // Handle key: true (auto-generate) or key: "custom-key"
      if (body.key) {
        secretKey = body.key === true ? generateSecretKey() : body.key;
        isPrivate = true; // If key is provided, paste is automatically private
      }

      if (!code) {
        return new Response(JSON.stringify({ error: 'Code is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Handle plain text
      code = await request.text();
      language = 'plaintext';
    }

    if (!code) {
      return new Response(JSON.stringify({ error: 'Code is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check paste size limit
    const maxSize = parseSize(config.maxPasteSize);
    const codeSize = new TextEncoder().encode(code).length;
    if (codeSize > maxSize) {
      return new Response(JSON.stringify({ error: `Paste too large. Maximum size is ${config.maxPasteSize}` }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate filename if not provided
    if (!filename || filename.trim() === '') {
      filename = await generateSnippetFilename(runtime.env.DB);
    }

    // Try up to 3 times with different IDs in case of collision
    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const id = generateId();
      const updated = Date.now();
      const lang = language || 'plaintext';

      try {
        await runtime.env.DB.prepare(
          'INSERT INTO pastes (id, code, language, updated, filename, is_private, secret_key) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(id, code, lang, updated, filename, isPrivate ? 1 : 0, secretKey)
          .run();

        // Success - return the response
        const baseUrl = `${new URL(request.url).origin}/${id}`;
        const url = secretKey ? `${baseUrl}?key=${secretKey}` : baseUrl;

        return new Response(
          JSON.stringify({
            id,
            url,
            private: isPrivate,
          }),
          {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        lastError = error;
        if (isUniqueConstraintError(error)) {
          // ID collision, try again with a new ID
          console.warn(`ID collision on attempt ${attempt + 1}, retrying...`);
          continue;
        }
        // Different error, don't retry
        throw error;
      }
    }

    // All attempts failed due to collision
    console.error('Failed to generate unique ID after', maxAttempts, 'attempts');
    return new Response(
      JSON.stringify({ error: 'Could not generate unique ID, please try again' }),
      {
        status: 500,
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
