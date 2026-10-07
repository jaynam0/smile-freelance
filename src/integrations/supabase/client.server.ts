// Server-side local database client stub
import { localDatabase } from '@/lib/local-db';

export const supabaseAdmin = localDatabase as any;
