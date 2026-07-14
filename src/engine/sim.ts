import { getMarket, TOTAL_MONTHS } from '../data/market'

export const CONTRIBUTION = 100 // dollars per month
export const BUY_MORE_AMOUNT = 500 // the one-time "someday fund" deploy

export interface Allocation {
  stocks: number
  bonds: number
  cash: number
}

export interface Balances {
  stocks: number
  bonds: number
  cash: number
}

export function total(b: Balances): number {
  return b.stocks + b.bonds + b.cash
}

const ALL_CASH: Allocation = { stocks: 0, bonds: 0, cash: 1 }

function applyMonth(b: Balances, t: number, alloc: Allocation, extra = 0): Balances {
  const m = getMarket()
  const stocks = b.stocks * (1 + m.stocks[t]) + (CONTRIBUTION + extra) * alloc.stocks
  const bonds = b.bonds * (1 + m.bonds[t]) + (CONTRIBUTION + extra) * alloc.bonds
  const cash = b.cash * (1 + m.cash[t]) + (CONTRIBUTION + extra) * alloc.cash
  return { stocks, bonds, cash }
}

function liquidate(b: Balances): Balances {
  return { stocks: 0, bonds: 0, cash: total(b) }
}

function reallocate(b: Balances, alloc: Allocation): Balances {
  const v = total(b)
  return { stocks: v * alloc.stocks, bonds: v * alloc.bonds, cash: v * alloc.cash }
}

/**
 * The interactive player simulation. Stepped one month at a time by the run
 * screen; decisions arrive through sell()/reenter()/buyMore().
 */
export class PlayerSim {
  alloc: Allocation
  balances: Balances = { stocks: 0, bonds: 0, cash: 0 }
  values: number[] = [] // total value at end of each month
  contributed = 0
  out = false // sold everything, sitting in cash
  sellIndexValue = 0 // stock index level when the player sold
  reentryPromptsShown = 0
  private pendingExtra = 0
  private peak = 0

  constructor(alloc: Allocation) {
    this.alloc = alloc
  }

  /** Advance one month. Returns the new total value. */
  step(t: number): number {
    const effective = this.out ? ALL_CASH : this.alloc
    this.balances = applyMonth(this.balances, t, effective, this.pendingExtra)
    this.contributed += CONTRIBUTION + this.pendingExtra
    this.pendingExtra = 0
    const v = total(this.balances)
    this.values.push(v)
    if (v > this.peak) this.peak = v
    return v
  }

  drawdown(): number {
    const v = total(this.balances)
    if (this.peak <= 0) return 0
    return (v - this.peak) / this.peak
  }

  sell(t: number): void {
    this.balances = liquidate(this.balances)
    this.out = true
    this.sellIndexValue = getMarket().stockIndex[t + 1]
    this.reentryPromptsShown = 0
  }

  /** Should we interrupt with a "get back in?" prompt at month t? */
  reentryDue(t: number): boolean {
    if (!this.out || this.reentryPromptsShown >= 3) return false
    const threshold = this.sellIndexValue * Math.pow(1.25, this.reentryPromptsShown + 1)
    return getMarket().stockIndex[t + 1] >= threshold
  }

  markReentryPrompt(): void {
    this.reentryPromptsShown += 1
  }

  reenter(): void {
    this.balances = reallocate(this.balances, this.alloc)
    this.out = false
  }

  buyMore(): void {
    this.pendingExtra = BUY_MORE_AMOUNT
  }
}

/**
 * Ghost trajectories are deterministic once the allocation is chosen, so they
 * are computed in full up front.
 */
export interface GhostRuns {
  panic: number[]
  cashOnly: number[]
  steady: number[] // "if you had never touched it" — used by the debrief verdict
  panicContributed: number
}

export function simulateGhosts(alloc: Allocation, eventMonths: number[]): GhostRuns {
  const m = getMarket()
  const events = new Set(eventMonths)

  // Cash ghost: never invests
  const cashOnly: number[] = []
  let cb: Balances = { stocks: 0, bonds: 0, cash: 0 }
  for (let t = 0; t < TOTAL_MONTHS; t++) {
    cb = applyMonth(cb, t, ALL_CASH)
    cashOnly.push(total(cb))
  }

  // Steady ghost: chosen allocation, never reacts
  const steady: number[] = []
  let sb: Balances = { stocks: 0, bonds: 0, cash: 0 }
  for (let t = 0; t < TOTAL_MONTHS; t++) {
    sb = applyMonth(sb, t, alloc)
    steady.push(total(sb))
  }

  // Panic ghost: sells at every event, buys back after a 25% rally off the sell point
  const panic: number[] = []
  let pb: Balances = { stocks: 0, bonds: 0, cash: 0 }
  let out = false
  let sellIdx = 0
  let contributed = 0
  for (let t = 0; t < TOTAL_MONTHS; t++) {
    pb = applyMonth(pb, t, out ? ALL_CASH : alloc)
    contributed += CONTRIBUTION
    if (!out && events.has(t)) {
      pb = liquidate(pb)
      out = true
      sellIdx = m.stockIndex[t + 1]
    } else if (out && m.stockIndex[t + 1] >= sellIdx * 1.25) {
      pb = reallocate(pb, alloc)
      out = false
    }
    panic.push(total(pb))
  }

  return { panic, cashOnly, steady, panicContributed: contributed }
}

export function fmtMoney(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export function fmtMoneyShort(v: number): string {
  if (v >= 1000) return '$' + (v / 1000).toFixed(v >= 100000 ? 0 : 1) + 'k'
  return '$' + Math.round(v)
}
