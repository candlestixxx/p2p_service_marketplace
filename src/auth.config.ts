import type { NextAuthConfig } from "next-auth"

// Edge compatible config for middleware
export default {
  providers: [], // Empty here, database-backed credentials goes to auth.ts
} satisfies NextAuthConfig
