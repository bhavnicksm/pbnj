import type { APIRoute } from 'astro';

// Generate human-readable ID: adjective-ingredient-ingredient-ingredient-thing
function generateId(): string {
  const adjectives = [
    'crunchy', 'smooth', 'chunky', 'creamy', 'toasted', 'grilled',
    'fresh', 'wild', 'organic', 'natural', 'homemade', 'artisan',
    'crispy', 'fluffy', 'golden', 'warm', 'sweet', 'savory',
    'tangy', 'spicy', 'mild', 'bold', 'classic', 'fancy',
    'simple', 'rustic', 'gourmet', 'premium', 'deluxe', 'perfect',
  ];

  const ingredients = [
    // Spreads & proteins
    'peanut', 'butter', 'jelly', 'jam', 'honey', 'nutella', 'almond',
    'cashew', 'hazelnut', 'tahini', 'hummus', 'avocado', 'cream', 'cheese',
    'ricotta', 'mayo', 'mustard', 'aioli', 'pesto', 'olive', 'tapenade',

    // Fruits & veggies
    'banana', 'strawberry', 'grape', 'raspberry', 'apricot', 'blueberry',
    'apple', 'pear', 'peach', 'plum', 'cherry', 'mango', 'fig',
    'tomato', 'cucumber', 'lettuce', 'spinach', 'arugula', 'kale',

    // Nuts & seeds
    'walnut', 'pecan', 'pistachio', 'sunflower', 'pumpkin',
    'flax', 'chia', 'sesame', 'poppy', 'hemp',

    // Flavors
    'chocolate', 'vanilla', 'cinnamon', 'coconut', 'maple', 'caramel',
    'marshmallow', 'pretzel', 'granola', 'oat', 'bacon', 'ham',
  ];

  const things = [
    'sandwich', 'burger', 'bun', 'wrap', 'bagel', 'roll',
    'toast', 'melt', 'panini', 'hoagie', 'sub', 'hero',
    'club', 'grinder', 'slider', 'pocket', 'pretzel', 'waffle',
  ];

  // Use crypto to randomly select words
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);

  const adjective = adjectives[bytes[0] % adjectives.length];
  const ingredient1 = ingredients[bytes[1] % ingredients.length];
  const ingredient2 = ingredients[bytes[2] % ingredients.length];
  const ingredient3 = ingredients[bytes[3] % ingredients.length];
  const thing = things[bytes[4] % things.length];

  return `${adjective}-${ingredient1}-${ingredient2}-${ingredient3}-${thing}`;
}

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
  return languageMap[ext || ''] || 'txt';
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

    let code: string;
    let language: string | undefined;
    let filename: string | undefined;

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
    } else if (contentType.includes('application/json')) {
      // Handle JSON (original format)
      const body = await request.json();
      code = body.code;
      language = body.language;

      if (!code) {
        return new Response(JSON.stringify({ error: 'Code is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Handle plain text
      code = await request.text();
      language = 'txt';
    }

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
      'INSERT INTO pastes (id, code, language, created, filename) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, code, language || 'txt', created, filename || null)
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
