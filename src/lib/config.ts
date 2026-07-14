// Supabase connection for the waitlist. The publishable key is designed to be
// public — row-level security only allows anonymous INSERTs into the waitlist
// table, never reads. Values can be overridden with Vite env vars.

export const SUPABASE_URL: string =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  'https://qiiephihtrjrrkjovagh.supabase.co'

export const SUPABASE_KEY: string =
  (import.meta.env.VITE_SUPABASE_KEY as string | undefined) ??
  'sb_publishable_7xIxo2SZIom95zhUHcj8Wg_x1Cd50E8'

export const waitlistConfigured = () => SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0
