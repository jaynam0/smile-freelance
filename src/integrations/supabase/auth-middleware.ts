// Auth middleware for local development
import { createMiddleware } from '@tanstack/react-start';
import { localDatabase } from '@/lib/local-db';

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    return next({
      context: {
        supabase: localDatabase,
        userId: "11111111-1111-1111-1111-111111111111",
        claims: { sub: "11111111-1111-1111-1111-111111111111" },
      },
    });
  },
);
