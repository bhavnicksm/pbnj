# CLI Reference

## Installation

```bash
npm install -g @pbnjs/cli
```

## Configuration

Run the setup wizard:
```bash
pbnj --init
```

This creates ~/.pbnj with your configuration:
```
PBNJ_HOST=https://your-pbnj.workers.dev
PBNJ_AUTH_KEY=your-secret-key
```

You can also set these as environment variables.

## Usage

### Upload a file
```bash
pbnj script.py
```

### Pipe content
```bash
cat logs.txt | pbnj
echo "hello world" | pbnj
```

### Read from stdin
```bash
pbnj -
pbnj - < file.txt
```

## Options

-L, --language <lang>    Override language detection
-f, --filename <name>    Set filename for the paste
-p, --private            Create a private paste (not listed on homepage)
-k, --key [key]          Require a key to view (auto-generates if no key given)
-n, --no-copy            Don't copy URL to clipboard
-u, --update <id>        Update an existing paste by ID
-l, --list               List recent pastes
-d, --delete <id>        Delete a paste by ID
-D, --delete-all         Delete all pastes
-h, --help               Show help
-v, --version            Show version

## Examples

### Upload with custom language
```bash
pbnj -L python script.txt
```

### Upload with custom filename
```bash
cat code | pbnj -f "app.js"
```

### Create a private paste
```bash
pbnj -p secret.txt
```

### Create a private paste with auto-generated key
```bash
pbnj -p -k secret.txt
# Returns: https://your-pbnj.workers.dev/abc123?key=xyz789
```

### Create a private paste with custom key
```bash
pbnj -p -k "mypassword" secret.txt
```

### List recent pastes
```bash
pbnj -l
```

### Update an existing paste
```bash
pbnj -u crunchy-peanut-butter-sandwich updated_file.py
```

### Delete a paste
```bash
pbnj -d crunchy-peanut-butter-sandwich
```

### Delete all pastes
```bash
pbnj -D
```

## Clipboard

The URL is automatically copied to your clipboard after upload. Use `-n` or `--no-copy` to disable this.

Supported on:
- macOS (pbcopy)
- Linux (xclip or xsel)
- Windows (clip)

---
Next: 05_api.md - HTTP API reference
