import { useState } from 'react'
import { joinWaitlist, WaitlistResult } from '../lib/waitlist'

const MESSAGES: Record<WaitlistResult, string> = {
  joined: "You're on the list. We'll write when the real-money bridge opens.",
  duplicate: "You're already on the list — good instincts, no need to double down.",
  invalid: "That doesn't look like an email address. One more try?",
  unavailable: 'The waitlist is warming up — check back shortly.',
  error: "Couldn't reach the waitlist just now. Try again in a minute.",
}

export function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<WaitlistResult | 'sending' | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setStatus(await joinWaitlist(email))
  }

  return (
    <div className="waitlist">
      <p>
        The next chapter is the graduation bridge: a checklist that walks you from this
        simulator to a real first $100 — a real account, a boring portfolio, an
        automatic monthly habit. Leave an email and you&apos;ll hear when it ships.
      </p>
      <form onSubmit={submit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          required
        />
        <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Joining…' : 'Join the waitlist'}
        </button>
      </form>
      {status && status !== 'sending' && (
        <div className={'wl-status' + (status === 'joined' || status === 'duplicate' ? '' : ' err')} role="status">
          {MESSAGES[status]}
        </div>
      )}
    </div>
  )
}
