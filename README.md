# The Long Game

**A flight simulator for investing.** Live through thirty years of real US market
history (1995–2024) in about ten minutes — crashes included — contributing a fake
$100/month. Two ghost portfolios race alongside you the whole way: **Panic You**,
who sells every crash and buys back after the recovery, and **Cash You**, who never
invests at all. The lesson is scored, never lectured.

Built for people who find investing intimidating: the game attacks fear of loss,
jargon, the "not enough money" myth, and analysis paralysis — by letting you
rehearse the scary parts with fake money until they're boring.

## How it plays

1. **Chapter 1 — What you actually own.** A 90-second illustrated explainer:
   shares are slices of real companies, an index fund is 500 slices at once.
2. **Setup.** Pick one of three boring allocations (Bold / Balanced / Cautious).
   That's the only configuration in the game — deliberately.
3. **The Run.** Time flows about a month per tick. It pauses only for five real
   historical crises (1998, 2001, 2008, 2020, 2022) where you choose: hold, buy
   the dip, or sell everything. Sell, and you'll be offered re-entry as the
   recovery runs away from you.
4. **Debrief.** Final chart vs. your ghosts, a teach-back quiz, badges
   (Iron Hands, Held Through 2008…), a downloadable run card, and a waitlist for
   the "first real $100" graduation bridge.

## Stack

- Vite + React + TypeScript, no backend — the whole simulation is client-side math
- Chart is hand-rolled SVG (CVD-validated palette, crosshair tooltip, table view)
- Supabase (waitlist only): anonymous inserts allowed by RLS, reads blocked
- Deployed on Vercel

## Data

Yearly figures are real published totals (S&P 500 total return, US aggregate bond
index, 3-month T-bills). Monthly paths use actual monthly shapes for the crash
years the game is about and smooth deterministic interpolation elsewhere,
normalized so every year compounds to its true annual figure. See
`src/data/market.ts`. v2 swaps in the Shiller monthly dataset.

## Develop

```bash
npm install
npm run dev
```

The waitlist needs two env vars (safe to expose; the key is a Supabase
publishable key guarded by insert-only RLS):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_KEY=...
```

Without them the app runs fine; the waitlist form reports itself unavailable.

## Disclaimer

The Long Game is an educational simulation. It is not investment advice, it
recommends no specific product, and past performance does not guarantee future
results.
