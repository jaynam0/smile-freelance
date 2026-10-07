// Supabase client replaced with custom local in-browser database & auth system.
// Fully persistent via localStorage, works 100% offline with zero external cloud dependencies.
import { localDatabase } from '@/lib/local-db';
export { localDatabase, resetLocalDatabase, getLocalDbData } from '@/lib/local-db';
export type { Database } from './types';

export const supabase = localDatabase as any;
