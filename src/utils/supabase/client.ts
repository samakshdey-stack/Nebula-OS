import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.NEXT_PUBLIC_SUPABASE_URL)) ||
  'https://tnxqacagjsdizsmbmfnk.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) ||
  'sb_publishable_gN_qdo2s0OwZI94ZeVtPZw_OV3IT-by';

/**
 * Creates and returns a Supabase browser client configured with the project credentials.
 */
export const createClient = (): SupabaseClient => {
  try {
    return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  } catch {
    return createSupabaseClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
};

/**
 * Singleton Supabase client instance for client-side operations.
 */
export const supabase = createClient();
