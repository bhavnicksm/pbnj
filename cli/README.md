<div align="center">

![pbnj logo](../assets/pbnj_logo.png)

# @pbnjs/cli

[![npm version](https://img.shields.io/npm/v/@pbnjs/cli?color=cb3837)](https://www.npmjs.com/package/@pbnjs/cli)
[![npm downloads](https://img.shields.io/npm/dm/@pbnjs/cli?color=blue)](https://www.npmjs.com/package/@pbnjs/cli)
[![License](https://img.shields.io/github/license/bhavnicksm/pbnj)](../LICENSE)

_The official CLI for [pbnj](https://github.com/bhavnicksm/pbnj) - paste code from your terminal_

</div>

## Installation

```bash
npm install -g @pbnjs/cli
```

Or use without installing:

```bash
npx @pbnjs/cli myfile.py
```

## Quick Start

```bash
# Configure your pbnj instance
pbnj --init

# Paste a file
pbnj script.py
# → https://pbnj.sh/crunchy-peanut-butter-toast (copied to clipboard)

# Pipe content
cat error.log | pbnj

# List your pastes
pbnj list

# Update an existing paste
pbnj -u crunchy-peanut-butter-toast newfile.py

# Delete a paste
pbnj -d crunchy-peanut-butter-toast
```

## Setup

Configure your pbnj instance:

```bash
pbnj --init
```

This will prompt you for:
- **Host URL**: Your pbnj instance URL
- **Auth Key**: Your secret key for creating pastes

Configuration is saved to `~/.pbnj`.

Alternatively, use environment variables:

```bash
export PBNJ_HOST=https://your-instance.workers.dev
export PBNJ_AUTH_KEY=your-secret-key
```

## Commands

### Create a paste

```bash
# From a file
pbnj script.py

# From stdin
cat error.log | pbnj
echo "console.log('hello')" | pbnj -L javascript

# With custom filename
pbnj -f "app.js" - < code.txt
```

### Update a paste

```bash
# Update with new file content
pbnj -u <paste-id> newfile.py

# Update from stdin
cat updated.log | pbnj -u <paste-id>
```

### List pastes

```bash
# List recent pastes (default: 10)
pbnj list

# List more pastes
pbnj list --limit 20
```

### Delete a paste

```bash
pbnj -d <paste-id>
```

## Options

| Option | Description |
|--------|-------------|
| `-L, --language <lang>` | Override automatic language detection |
| `-f, --filename <name>` | Set filename for the paste |
| `-u, --update <id>` | Update an existing paste |
| `-d, --delete <id>` | Delete a paste by ID |
| `-p, --private` | Create a private (unlisted) paste |
| `-s, --secret <key>` | Set a secret key for private paste |
| `-h, --help` | Show help |
| `-v, --version` | Show version |
| `--init` | Configure your pbnj instance |

### List command options

| Option | Description |
|--------|-------------|
| `-l, --limit <n>` | Number of pastes to show (default: 10) |

## Supported Languages

The CLI automatically detects language from file extensions:

- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- Python (`.py`)
- Rust (`.rs`)
- Go (`.go`)
- Ruby (`.rb`)
- And 30+ more...

## License

MIT
