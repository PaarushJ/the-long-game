import { SUPABASE_URL, SUPABASE_KEY, waitlistConfigured } from './config'

export type WaitlistResult = 'joined' | 'duplicate' | 'invalid' | 'unavailable' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function joinWaitlist(email: string): Promise<WaitlistResult> {
  const trimmed = email.trim().toLowerCase()
  if (!EMAIL_RE.test(trimmed)) return 'invalid'
  if (!waitlistConfigured()) return 'unavailable'
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email: trimmed }),
    })
    if (res.status === 201) return 'joined'
    if (res.status === 409) return 'duplicate'
    return 'error'
  } catch {
    return 'error'
  }
}
