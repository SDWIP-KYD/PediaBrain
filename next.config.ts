import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Required env vars — set these in Vercel dashboard or .env.local
    // AUTH_PASSWORD: your single-user password
    // SESSION_SECRET: minimum 32 chars random string — generate with:
    //   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  },
};

export default nextConfig;