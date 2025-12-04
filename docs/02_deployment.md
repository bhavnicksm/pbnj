# Deployment Guide

## One-Click Deploy (Recommended)

Click the "Deploy to Cloudflare" button on the GitHub repo — that's it!

The deploy button automatically:
- Forks the repo to your GitHub account
- Creates a Cloudflare Pages project
- Provisions a D1 database
- Runs the database migrations
- Sets up your AUTH_KEY secret
- Deploys the application

Your pastebin will be live in under 60 seconds. No configuration needed.

## Manual Deployment

### Prerequisites

- Node.js 18+
- A Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/bhavnicksm/pbnj
   cd pbnj
   npm install
   ```

2. Login to Cloudflare:
   ```bash
   npx wrangler login
   ```

3. Create a D1 database:
   ```bash
   npx wrangler d1 create pbnj-db
   ```

4. Copy the database_id from the output and update wrangler.toml:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "pbnj-db"
   database_id = "YOUR_DATABASE_ID_HERE"
   ```

5. Run the schema migration:
   ```bash
   npx wrangler d1 execute pbnj-db --remote --file=schema/schema.sql
   ```

6. Set your AUTH_KEY secret:
   ```bash
   npx wrangler secret put AUTH_KEY
   ```
   Enter a secret key when prompted. Save this - you'll need it for the CLI.

7. Build and deploy:
   ```bash
   npm run build
   npx wrangler deploy
   ```

## Custom Domain

To use a custom domain (e.g., paste.yourdomain.com):

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages > your worker
3. Go to Settings > Domains & Routes
4. Add your custom domain

## Local Development

1. Copy `.dev.vars.example` to `.dev.vars`
2. Set your AUTH_KEY in `.dev.vars`
3. Run `npm run dev`

The local server will be available at http://localhost:4321

---
Next: 03_cost.md - Cloudflare pricing breakdown
