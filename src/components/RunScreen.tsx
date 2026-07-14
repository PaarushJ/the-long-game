import { useEffect, useRef, useState } from 'react'
import { monthLabel, TOTAL_MONTHS } from '../data/market'
import { COACH_TICKS, EVENTS, eventMonths, REENTRY_PROMPTS } from '../data/events'
import { Allocation, CONTRIBUTION, fmtMoney, GhostRuns, PlayerSim, simulateGhosts } from '../engine/sim'
import { RunChart, ChartLegend } from './RunChart'
import { EventChoice, EventModal, ReentryModal } from './EventModal'

export interface DecisionLog {
  eventId: string
  choice: EventChoice
}

export interface RunResult {
  playerValues: number[]
  ghosts: GhostRuns
  contributed: number
  decisions: DecisionLog[]
  reentries: boolean[] // choices made at re-entry prompts
  endedInCash: boolean
  alloc: Allocation
}

const TICK_MS = 50
const MONTHS_PER_SEC = 18 // full run ≈ 20s of pure runtime at 1×
const MAX_CATCHUP = 40 // cap per timer fire so a throttled tab doesn't teleport

const CHOICE_REACTIONS: Record<EventChoice, string> = {
  hold: 'Held. Your $100 keeps buying every month — and this month it buys more shares than last month, because everything is cheaper.',
  buyMore: 'Bought the dip. Uncomfortable, historically excellent. Your extra $500 just bought shares at fire-sale prices.',
  sell: "Sold. The fear is gone — and so is your position. Watch what the market does next, and what your money doesn't.",
}

export function RunScreen({ alloc, onDone }: { alloc: Allocation; onDone: (r: RunResult) => void }) {
  const simRef = useRef<PlayerSim>()
  const ghostsRef = useRef<GhostRuns>()
  if (!simRef.current) {
    simRef.current = new PlayerSim(alloc)
    ghostsRef.current = simulateGhosts(alloc, eventMonths)
  }
  const sim = simRef.current
  const ghosts = ghostsRef.current!

  const [t, setT] = useState(0) // months completed
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [pendingEvent, setPendingEvent] = useState<number>(-1) // index into EVENTS
  const [pendingReentry, setPendingReentry] = useState<number>(-1) // index into REENTRY_PROMPTS
  const [coach, setCoach] = useState('Away we go. It is January 1995 and you have $0 and a plan.')
  const decisionsRef = useRef<DecisionLog[]>([])
  const reentriesRef = useRef<boolean[]>([])
  const doneRef = useRef(false)

  useEffect(() => {
    if (!running || doneRef.current) return
    let last = performance.now()
    let carry = 0
    const id = setInterval(() => {
      const now = performance.now()
      const monthsFloat = ((now - last) / 1000) * MONTHS_PER_SEC * speed + carry
      last = now
      let steps = Math.min(Math.floor(monthsFloat), MAX_CATCHUP)
      carry = Math.min(monthsFloat - Math.floor(monthsFloat), 1)
      let cur = sim.values.length
      for (let s = 0; s < steps; s++) {
        if (cur >= TOTAL_MONTHS) break
        sim.step(cur)
        const evIdx = EVENTS.findIndex((e) => e.t === cur)
        cur = sim.values.length
        if (evIdx >= 0 && !sim.out) {
          setPendingEvent(evIdx)
          setRunning(false)
          break
        }
        if (sim.reentryDue(cur - 1)) {
          sim.markReentryPrompt()
          setPendingReentry(Math.min(sim.reentryPromptsShown - 1, REENTRY_PROMPTS.length - 1))
          setRunning(false)
          break
        }
        const tick = COACH_TICKS[cur - 1]
        if (tick) setCoach(tick)
      }
      setT(cur)
      if (cur >= TOTAL_MONTHS && !doneRef.current) {
        doneRef.current = true
        onDone({
          playerValues: [...sim.values],
          ghosts,
          contributed: sim.contributed,
          decisions: [...decisionsRef.current],
          reentries: [...reentriesRef.current],
          endedInCash: sim.out,
          alloc,
        })
      }
    }, TICK_MS)
    return () => clearInterval(id)
  }, [running, speed, sim, ghosts, alloc, onDone])

  const handleEventChoice = (c: EventChoice) => {
    const ev = EVENTS[pendingEvent]
    decisionsRef.current.push({ eventId: ev.id, choice: c })
    if (c === 'sell') sim.sell(t - 1)
    if (c === 'buyMore') sim.buyMore()
    setCoach(CHOICE_REACTIONS[c])
    setPendingEvent(-1)
    setRunning(true)
  }

  const handleReentry = (back: boolean) => {
    reentriesRef.current.push(back)
    if (back) {
      sim.reenter()
      setCoach('Back in — at higher prices than you sold. The market charged you tuition for that round trip.')
    } else {
      setCoach('Still out. Every month in cash is a month your contributions buy no shares of anything.')
    }
    setPendingReentry(-1)
    setRunning(true)
  }

  const value = sim.values[t - 1] ?? 0
  const series = {
    you: sim.values,
    panic: ghosts.panic.slice(0, t),
    cash: ghosts.cashOnly.slice(0, t),
  }

  return (
    <div>
      <div className="run-hud">
        <div>
          <div className="hud-date">{t < TOTAL_MONTHS ? monthLabel(Math.max(0, t - 1)) : 'Dec 2024'}</div>
          <div className="hud-value">{fmtMoney(value)}</div>
          <div className="hud-sub">
            {fmtMoney(sim.contributed)} contributed · ${CONTRIBUTION}/mo
            {sim.out && ' · SITTING IN CASH'}
          </div>
        </div>
        <div className="hud-controls">
          <button className="btn" onClick={() => setRunning((r) => !r)} disabled={pendingEvent >= 0 || pendingReentry >= 0}>
            {running ? 'Pause' : 'Resume'}
          </button>
          <button className="btn" onClick={() => setSpeed((s) => (s === 1 ? 3 : 1))} aria-pressed={speed > 1}>
            {speed === 1 ? 'Speed ×3' : 'Speed ×1'}
          </button>
        </div>
      </div>
      <ChartLegend
        finals={t > 0 ? { you: value, panic: ghosts.panic[t - 1], cash: ghosts.cashOnly[t - 1] } : undefined}
      />
      <RunChart series={series} eventTs={eventMonths} />
      <div className="coach-toast" role="status">
        <span className="who">Coach</span>
        <span className="msg">{coach}</span>
      </div>
      {pendingEvent >= 0 && (
        <EventModal
          event={EVENTS[pendingEvent]}
          value={value}
          drawdownPct={sim.drawdown() * 100}
          onChoose={handleEventChoice}
        />
      )}
      {pendingReentry >= 0 && <ReentryModal prompt={REENTRY_PROMPTS[pendingReentry]} onChoose={handleReentry} />}
    </div>
  )
}
