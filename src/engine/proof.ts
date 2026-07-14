import { getMarket, TOTAL_MONTHS } from '../data/market'
import { CONTRIBUTION } from './sim'

// The Proof: $100/month into the index fund, started at EVERY possible month
// since Jan 1995, versus the same money in cash. No cherry-picking — the
// losing windows are shown as plainly as the winning ones.

export interface ProofWindow {
  start: number // month index, Jan 1995 = 0
  fvStock: number
  fvCash: number
  contributed: number
}

export type WindowStatus = 'win' | 'lag' | 'loss'

export const HORIZONS = [60, 120, 180, 240] as const
export type Horizon = (typeof HORIZONS)[number]

const cache = new Map<number, ProofWindow[]>()

export function computeWindows(h: Horizon): ProofWindow[] {
  const hit = cache.get(h)
  if (hit) return hit
  const m = getMarket()
  const out: ProofWindow[] = []
  for (let s = 0; s + h <= TOTAL_MONTHS; s++) {
    let st = 0
    let ca = 0
    for (let t = s; t < s + h; t++) {
      st = st * (1 + m.stocks[t]) + CONTRIBUTION
      ca = ca * (1 + m.cash[t]) + CONTRIBUTION
    }
    out.push({ start: s, fvStock: st, fvCash: ca, contributed: h * CONTRIBUTION })
  }
  cache.set(h, out)
  return out
}

export function windowStatus(w: ProofWindow): WindowStatus {
  if (w.fvStock < w.contributed) return 'loss'
  if (w.fvStock > w.fvCash) return 'win'
  return 'lag'
}

export interface ProofStats {
  count: number
  beatCash: number
  lostMoney: number
  worstIdx: number
  bestIdx: number
  medianMultiple: number
}

export function proofStats(windows: ProofWindow[]): ProofStats {
  const mult = (w: ProofWindow) => w.fvStock / w.contributed
  let worstIdx = 0
  let bestIdx = 0
  windows.forEach((w, i) => {
    if (mult(w) < mult(windows[worstIdx])) worstIdx = i
    if (mult(w) > mult(windows[bestIdx])) bestIdx = i
  })
  const sorted = windows.map(mult).sort((a, b) => a - b)
  return {
    count: windows.length,
    beatCash: windows.filter((w) => w.fvStock > w.fvCash).length,
    lostMoney: windows.filter((w) => w.fvStock < w.contributed).length,
    worstIdx,
    bestIdx,
    medianMultiple: sorted[Math.floor(sorted.length / 2)],
  }
}

export interface WindowSeries {
  stock: number[]
  cash: number[]
  contrib: number[]
}

/** Month-by-month trajectories for one window, for the detail chart. */
export function windowSeries(start: number, h: Horizon): WindowSeries {
  const m = getMarket()
  const stock: number[] = []
  const cash: number[] = []
  const contrib: number[] = []
  let st = 0
  let ca = 0
  for (let t = start; t < start + h; t++) {
    st = st * (1 + m.stocks[t]) + CONTRIBUTION
    ca = ca * (1 + m.cash[t]) + CONTRIBUTION
    stock.push(st)
    cash.push(ca)
    contrib.push((t - start + 1) * CONTRIBUTION)
  }
  return { stock, cash, contrib }
}
