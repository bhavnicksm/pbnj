#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { basename, extname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const CONFIG_FILE = `${process.env.HOME}/.pbnj`;

// Language detection from file extension
const LANG_MAP = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'c',
  '.cs': 'csharp',
  '.php': 'php',
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.html': 'html',
  '.css': 'css',
  '.json': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.sql': 'sql',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.r': 'r',
  '.R': 'r',
  '.lua': 'lua',
  '.pl': 'perl',
  '.ex': 'elixir',
  '.exs': 'elixir',
  '.erl': 'erlang',
  '.hs': 'haskell',
  '.ml': 'ocaml',
  '.clj': 'clojure',
  '.vim': 'vim',
  '.dockerfile': 'dockerfile',
  '.toml': 'toml',
  '.ini': 'ini',
  '.txt': 'plaintext',
};

function getConfig() {
  if (existsSync(CONFIG_FILE)) {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    const config = {};
    for (const line of content.split('\n')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        config[key.trim()] = valueParts.join('=').trim();
      }
    }
    return config;
  }
  return {};
}

function detectLanguage(filename) {
  if (!filename) return 'plaintext';
  const ext = extname(filename).toLowerCase();
  return LANG_MAP[ext] || 'plaintext';
}

async function copyToClipboard(text) {
  const platform = process.platform;
  try {
    if (platform === 'darwin') {
      await execAsync(`echo "${text}" | pbcopy`);
    } else if (platform === 'linux') {
      // Try xclip first, then xsel
      try {
        await execAsync(`echo "${text}" | xclip -selection clipboard`);
      } catch {
        await execAsync(`echo "${text}" | xsel --clipboard --input`);
      }
    } else if (platform === 'win32') {
      await execAsync(`echo ${text} | clip`);
    }
    return true;
  } catch {
    return false;
  }
}

async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

function showHelp() {
  console.log(`
pbnj - CLI for pbnj.sh pastebin

Usage:
  pbnj <file>              Upload a file
  pbnj -                   Read from stdin
  cat file | pbnj          Pipe content
  pbnj -u <id> <file>      Update an existing paste
  pbnj -l [n]              List recent pastes (default: 10, or specify count)
  pbnj -d <id>             Delete a paste
  pbnj -D                  Delete all pastes
  pbnj --init              Configure your pbnj instance

Options:
  -L, --language <lang>    Override language detection
  -f, --filename <name>    Set filename for the paste
  -p, --private            Create a private paste (not listed on homepage)
  -k, --key [key]          Require a key to view (auto-generates if no key given)
  -n, --no-copy            Don't copy URL to clipboard
  -u, --update <id>        Update an existing paste by ID
  -l, --list [n]           List recent pastes (default: 10)
  -d, --delete <id>        Delete a paste by ID
  -D, --delete-all         Delete all pastes
  -h, --help               Show this help
  -v, --version            Show version
  --init                   Set up configuration

Configuration (~/.pbnj):
  PBNJ_HOST=https://your-pbnj-instance.workers.dev
  PBNJ_AUTH_KEY=your-secret-key

Examples:
  pbnj script.py                    # Upload Python file
  cat logs.txt | pbnj -L plaintext  # Pipe with language
  pbnj -f "app.js" - < code.txt     # Custom filename from stdin
  pbnj -p script.py                 # Upload as private (unlisted)
  pbnj -p -k script.py              # Private with auto-generated key
  pbnj -p -k "mykey" script.py      # Private with custom key
  pbnj -u crunchy-peanut-butter file.py  # Update a paste
  pbnj -l                           # Show recent pastes
  pbnj -d crunchy-peanut-butter     # Delete a paste
`);
}

async function initConfig() {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q) => new Promise((resolve) => rl.question(q, resolve));

  console.log(`
                                ███████
                          ███▓           ███
                    ████                     ██░
              ████                               ███
       ▒███▓                                         ████
   ██░                                                     ███▒
 █                                                              ███
 ██                                                                █
 █▒███                                                             ██
 █▒▒▒▒▒███                                                     ███▒█
 █▒▒▒▒▒▒▒▒▒▒▒███                                          ███▒▒▒▒▒▒█
  ███▒▒▒▒▒▒▒▒▒▒▒▒▒██                             ░  ████▒▒▒▒▒▒▒▒▒▒▒█
 ██▒█████▒▒▒▒▒▒▒▒▒▒▒██                         ███▒▒▒▒▒▒▒▒▒▒▒▒▒████
███████████████▒▒▒▒▒▒▒▒██                 ███▒▒▒▒▒▒▒▒▒▒▒▒▒███████▓██
███░░  ▒██░████████▒▒▒▓▒▒▒████      ▒███▓▒▒▒▒▒▒▒▒▒▓▒▒██████████████░█
██▒▒███░░████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▒▒▓▒▒▒▒▒▒▓███████████████░░▒░██
██▒▒▒▒▒█░░░░░   ░███████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████████████░░░░░░░░░██▒▒█
 ██▒▒▒▒▓▓██████░ ░██████████▒▒▒▒▒▒▒▒▒▒▒██████████████░ ▒▒▒░███▒▒▒▒▒▒█
    ██▒▒▒▒▒▒▒▒▒▓█░░░███████████████████████████████░░░██▓▓▒▒▒▒▒▒▒▒▒█
       ████▓▒▒▒▒▓██░░░   ░█████████████████░  ▒▒░░▒██▒▒▒▒▒▒▒▒▒▒███
            ███▒▒▒▒▓▓███▒░░░████████████░░ ▒▒██▓▓▓▓▒▒▓▒▒▒▒████
                ██▒▒▒▒▒▒▒█░░ ░░░░░  ░▒▒▒▒▒██▒▒▒▒▓▒▒▒▒███
                   ██▒▒▒▒▒▒▓██████████▓▓▓▓▒▒▓▒▒▒███
                     ██▒▒▒▒▒▒▒▒▒▒▒▒▒▓▒▒▒▒▒▒▓███
                        ██▒▒▒▒▒▒▒▒▒▒▓▒▒▒███
                            ██████████

                            p b n j . s h
`);

  console.log('Configuring pbnj CLI\n');

  const host = await question('Host URL: ');
  const authKey = await question('Auth Key: ');

  rl.close();

  const config = `PBNJ_HOST=${host}\nPBNJ_AUTH_KEY=${authKey}\n`;

  const { writeFileSync } = await import('fs');
  writeFileSync(CONFIG_FILE, config, { mode: 0o600 });

  console.log(`\nConfiguration saved to ${CONFIG_FILE}`);
}

async function deleteAllPastes(config) {
  const host = process.env.PBNJ_HOST || config.PBNJ_HOST;
  const authKey = process.env.PBNJ_AUTH_KEY || config.PBNJ_AUTH_KEY;

  if (!host) {
    console.error('Error: No host configured.');
    console.error('Run `pbnj --init` or set PBNJ_HOST environment variable.');
    process.exit(1);
  }

  if (!authKey) {
    console.error('Error: No auth key configured.');
    console.error('Run `pbnj --init` or set PBNJ_AUTH_KEY environment variable.');
    process.exit(1);
  }

  try {
    const response = await fetch(`${host}/api/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`Error: ${error.error || response.statusText}`);
      process.exit(1);
    }

    console.log('🗑️  [all pastes deleted]');
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function deletePaste(id, config) {
  const host = process.env.PBNJ_HOST || config.PBNJ_HOST;
  const authKey = process.env.PBNJ_AUTH_KEY || config.PBNJ_AUTH_KEY;

  if (!host) {
    console.error('Error: No host configured.');
    console.error('Run `pbnj --init` or set PBNJ_HOST environment variable.');
    process.exit(1);
  }

  if (!authKey) {
    console.error('Error: No auth key configured.');
    console.error('Run `pbnj --init` or set PBNJ_AUTH_KEY environment variable.');
    process.exit(1);
  }

  try {
    const response = await fetch(`${host}/api/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`Error: ${error.error || response.statusText}`);
      process.exit(1);
    }

    console.log(`🗑️  [deleted: ${id}]`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function updatePaste(id, code, language, filename, config) {
  const host = process.env.PBNJ_HOST || config.PBNJ_HOST;
  const authKey = process.env.PBNJ_AUTH_KEY || config.PBNJ_AUTH_KEY;

  if (!host) {
    console.error('Error: No host configured.');
    console.error('Run `pbnj --init` or set PBNJ_HOST environment variable.');
    process.exit(1);
  }

  if (!authKey) {
    console.error('Error: No auth key configured.');
    console.error('Run `pbnj --init` or set PBNJ_AUTH_KEY environment variable.');
    process.exit(1);
  }

  const body = { code };
  if (language) body.language = language;
  if (filename) body.filename = filename;

  try {
    const response = await fetch(`${host}/api/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`Error: ${error.error || response.statusText}`);
      process.exit(1);
    }

    return `${host}/${id}`;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function listPastes(config, limit = 10) {
  const host = process.env.PBNJ_HOST || config.PBNJ_HOST;

  if (!host) {
    console.error('Error: No host configured.');
    console.error('Run `pbnj --init` or set PBNJ_HOST environment variable.');
    process.exit(1);
  }

  try {
    const response = await fetch(`${host}/api`);

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      process.exit(1);
    }

    const { pastes } = await response.json();

    if (pastes.length === 0) {
      console.log('📭 [no pastes found]');
      return;
    }

    const displayPastes = pastes.slice(0, limit);

    // Calculate column widths
    const idWidth = Math.max(2, ...displayPastes.map(p => p.id.length));
    const langWidth = Math.max(4, ...displayPastes.map(p => p.language.length));
    const ageWidth = 8;

    // Print header
    const idHeader = 'ID'.padEnd(idWidth);
    const langHeader = 'LANG'.padEnd(langWidth);
    const ageHeader = 'AGE'.padStart(ageWidth);
    console.log(`${idHeader}  ${langHeader}  ${ageHeader}  NAME`);

    for (const paste of displayPastes) {
      const name = paste.filename || `${paste.id}.${paste.language}`;
      const age = formatAge(paste.updated);
      const id = paste.id.padEnd(idWidth);
      const lang = paste.language.padEnd(langWidth);
      const ageStr = age.padStart(ageWidth);
      console.log(`${id}  ${lang}  ${ageStr}  ${name}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function formatAge(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

async function uploadPaste(code, language, filename, config, options = {}) {
  const host = process.env.PBNJ_HOST || config.PBNJ_HOST;
  const authKey = process.env.PBNJ_AUTH_KEY || config.PBNJ_AUTH_KEY;

  if (!host) {
    console.error('Error: No host configured.');
    console.error('Run `pbnj --init` or set PBNJ_HOST environment variable.');
    process.exit(1);
  }

  if (!authKey) {
    console.error('Error: No auth key configured.');
    console.error('Run `pbnj --init` or set PBNJ_AUTH_KEY environment variable.');
    process.exit(1);
  }

  const body = { code, language };
  if (filename) body.filename = filename;
  if (options.isPrivate) body.private = true;
  if (options.secretKey) body.key = options.secretKey;

  try {
    const response = await fetch(`${host}/api`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`Error: ${error.error || response.statusText}`);
      process.exit(1);
    }

    const result = await response.json();
    return result.url;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Parse flags
  let language = null;
  let filename = null;
  let inputFile = null;
  let isPrivate = false;
  let secretKey = null;
  let updateId = null;
  let noCopy = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      showHelp();
      process.exit(0);
    }

    if (arg === '-v' || arg === '--version') {
      const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
      console.log(pkg.version);
      process.exit(0);
    }

    if (arg === '--init') {
      await initConfig();
      process.exit(0);
    }

    if (arg === '-l' || arg === '--list') {
      // Check if next arg is a number (limit)
      const nextArg = args[i + 1];
      let limit = 10;
      if (nextArg && /^\d+$/.test(nextArg)) {
        limit = parseInt(nextArg, 10);
        i++;
      }
      const config = getConfig();
      await listPastes(config, limit);
      process.exit(0);
    }

    if (arg === '-D' || arg === '--delete-all') {
      const config = getConfig();
      await deleteAllPastes(config);
      process.exit(0);
    }

    if (arg === '-d' || arg === '--delete') {
      const id = args[++i];
      if (!id) {
        console.error('Error: Paste ID required for delete');
        process.exit(1);
      }
      const config = getConfig();
      await deletePaste(id, config);
      process.exit(0);
    }

    if (arg === '-L' || arg === '--language') {
      language = args[++i];
      continue;
    }

    if (arg === '-f' || arg === '--filename') {
      filename = args[++i];
      continue;
    }

    if (arg === '-u' || arg === '--update') {
      updateId = args[++i];
      if (!updateId) {
        console.error('Error: Paste ID required for update');
        process.exit(1);
      }
      continue;
    }

    if (arg === '-p' || arg === '--private') {
      isPrivate = true;
      continue;
    }

    if (arg === '-n' || arg === '--no-copy') {
      noCopy = true;
      continue;
    }

    if (arg === '-k' || arg === '--key') {
      // Check if next arg is a value (not another flag or file)
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-') && nextArg !== '-') {
        // Check if it looks like a key value (not a filename)
        // If it has no extension or is alphanumeric only, treat as key
        if (!nextArg.includes('.') || /^[a-zA-Z0-9_-]+$/.test(nextArg)) {
          secretKey = nextArg;
          i++;
        } else {
          // No key value provided, auto-generate
          secretKey = true;
        }
      } else {
        // No key value provided, auto-generate
        secretKey = true;
      }
      isPrivate = true; // -k implies -p
      continue;
    }

    // Non-flag argument is the file
    if (!arg.startsWith('-') || arg === '-') {
      inputFile = arg;
    }
  }

  const config = getConfig();
  let code;

  // Check if stdin has data (piped input)
  const stdinIsTTY = process.stdin.isTTY;

  if (inputFile === '-' || (!inputFile && !stdinIsTTY)) {
    // Read from stdin
    code = await readStdin();
    if (!language) language = 'plaintext';
  } else if (inputFile) {
    // Read from file
    if (!existsSync(inputFile)) {
      console.error(`Error: File not found: ${inputFile}`);
      process.exit(1);
    }
    code = readFileSync(inputFile, 'utf-8');
    if (!filename) filename = basename(inputFile);
    if (!language) language = detectLanguage(inputFile);
  } else {
    showHelp();
    process.exit(1);
  }

  if (!code || code.trim() === '') {
    console.error('Error: No content to upload');
    process.exit(1);
  }

  let url;
  if (updateId) {
    // Update existing paste
    url = await updatePaste(updateId, code, language, filename, config);
    console.log(url);
    console.log('✏️  [updated]');
  } else {
    // Create new paste
    url = await uploadPaste(code, language, filename, config, {
      isPrivate,
      secretKey,
    });

    console.log(url);
    if (isPrivate) {
      console.log('🔒 [private paste - not listed on homepage]');
    }
  }

  // Try to copy to clipboard (unless --no-copy)
  if (!noCopy) {
    const copied = await copyToClipboard(url);
    if (copied) {
      console.log('📋 [copied to clipboard]');
    }
  }
}

main();
