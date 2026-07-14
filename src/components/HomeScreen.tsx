import { useEffect, useMemo, useState } from 'react'
import { monthLabel, TOTAL_MONTHS } from '../data/market'
import { EVENTS, eventMonths } from '../data/events'
import { simulateGhosts } from '../engine/sim'
import { RunChart, ChartLegend } from './RunChart'

// The home page mini game: the whole 30-year race, auto-played in ~13 seconds.
// No decisions, no interruptions — the graph tells the story by itself.

const MINI_ALLOC = { stocks: 0.7, bonds: 0.25, cash: 0.05 }
const RACE_MS = 13000

export function HomeScreen({ onStart, onProof }: { onStart: () => void; onProof: () => void }) {
  const ghosts = useMemo(() => simulateGhosts(MINI_ALLOC, eventMonths), [])
  const [t, setT] = useState(1)
  const [playKey, setPlayKey] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setT(TOTAL_MONTHS)
      return
    }
    setT(1)
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const frac = Math.min(1, (now - t0) / RACE_MS)
      setT(Math.max(1, Math.round(frac * TOTAL_MONTHS)))
      if (frac < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playKey])

  const done = t >= TOTAL_MONTHS
  const series = {
    you: ghosts.steady.slice(0, t),
    panic: ghosts.panic.slice(0, t),
    cash: ghosts.cashOnly.slice(0, t),
  }
  const crisis = EVENTS.filter((e) => e.t <= t - 1 && t - 1 - e.t < 18).pop()
  const caption = done
    ? 'Thirty years, five crises, one habit. Hover the chart to explore.'
    : crisis
      ? `${crisis.dateLabel} — ${crisis.headline}`
      : '$100 goes in every month. No exceptions, no timing.'

  return (
    <div className="home">
      <p className="eyebrow">A flight simulator for investing</p>
      <h1>The Long Game</h1>
      <p className="home-dek">
        Thirty years of real market history in fifteen seconds. <strong>You</strong> invests
        $100 a month and never flinches. <strong>Panic You</strong> sells every crash.{' '}
        <strong>Cash You</strong> never invests at all. Same paycheck, three endings.
      </p>
      <div
        className="mini-race"
        aria-label="Animated race, 1995 to 2024: a steady investor versus a panic seller versus a cash saver"
      >
        <div className="mini-hud">
          <span className="mini-date">{monthLabel(Math.min(t, TOTAL_MONTHS) - 1)}</span>
          <span className={'mini-flash' + (crisis && !done ? ' crisis' : '')}>{caption}</span>
        </div>
        <ChartLegend
          finals={{ you: ghosts.steady[t - 1], panic: ghosts.panic[t - 1], cash: ghosts.cashOnly[t - 1] }}
        />
        <RunChart series={series} eventTs={eventMonths} interactive={done} />
      </div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onStart}>
          Start Learning
        </button>
        <button className="btn btn-ghost" onClick={() => setPlayKey((k) => k + 1)}>
          Replay the 30 years
        </button>
      </div>
      <button className="proof-link" onClick={onProof}>
        Skeptical? Good. → See every start date since 1995, tested. No cherry-picking.
      </button>
    </div>
  )
}
