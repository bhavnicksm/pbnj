/// <reference types="astro/client" />

// Runtime environment types for both Cloudflare and Node.js
interface RuntimeEnv {
  DB: import('@/lib/db').Database;
  AUTH_KEY: string;
}

declare namespace App {
  interface Locals {
    runtime?: {
      env: RuntimeEnv;
    };
  }
}
