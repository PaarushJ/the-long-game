import { useMemo, useState } from 'react'
import { monthLabel } from '../data/market'
import { fmtMoney, fmtMoneyShort } from '../engine/sim'
import {
  computeWindows,
  Horizon,
  HORIZONS,
  proofStats,
  windowSeries,
  windowStatus,
  WindowStatus,
} from '../engine/proof'

const STATUS_FILL: Record<WindowStatus, string> = {
  win: 'var(--s-you)',
  lag: '#5c6b64',
  loss: 'var(--s-panic)',
}
const STATUS_NAME: Record<WindowStatus, string> = {
  win: 'beat cash',
  lag: 'made money, trailed cash',
  loss: 'lost money',
}

const HORIZON_KICKER: Record<Horizon, string> = {
  60: 'At five years, the market can genuinely hurt you — this is why money you need soon does not belong in stocks. Keep scrolling up in years and watch the red disappear.',
  120: 'At ten years the losers get rare, and every one of them is the same story: starting at the very top of the dot-com bubble. Bad decade, wrong conclusion — give it five more years.',
  180: 'Zero. Of all possible fifteen-year start dates — including the eve of every crash since 1995 — not one lost money, and every single one beat cash. Go ahead, click around. There are none.',
  240: 'Every twenty-year start date at least doubled the money. The unluckiest investor of the last thirty years still turned patience into a 2.1× outcome. Timing barely matters. Time is everything.',
}

/* ---------- detail chart for one selected window ---------- */

const CW = 720
const CH = 250
const PL = 10
const PR = 96
const PT = 14
const PB = 26
const CIW = CW - PL - PR
const CIH = CH - PT - PB

function nicePlotMax(v: number): number {
  const steps = [1000, 2500, 5000, 10000, 15000, 25000, 40000, 60000, 80000, 120000, 200000]
  for (const s of steps) if (s >= v) return s
  return steps[steps.length - 1]
}

function linePath(vals: number[], yMax: number): string {
  const n = vals.length
  return (
    'M' +
    vals
      .map((v, i) => `${(PL + (i / (n - 1)) * CIW).toFixed(1)},${(PT + (1 - v / yMax) * CIH).toFixed(1)}`)
      .join('L')
  )
}

function WindowChart({ start, horizon }: { start: number; horizon: Horizon }) {
  const series = useMemo(() => windowSeries(start, horizon), [start, horizon])
  const yMax = nicePlotMax(Math.max(...series.stock, ...series.cash) * 1.1)
  const n = series.stock.length
  const endY = (vals: number[]) => PT + (1 - vals[n - 1] / yMax) * CIH
  // keep the two end labels from overlapping
  let yStock = endY(series.stock)
  let yCash = endY(series.cash)
  if (Math.abs(yStock - yCash) < 15) {
    if (yStock < yCash) yCash = yStock + 15
    else yStock = yCash + 15
  }
  const years = Math.round(horizon / 12)
  const ticks = [0, Math.floor(n / 2), n - 1]
  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      role="img"
      aria-label={`Investing $100 a month starting ${monthLabel(start)} for ${years} years: index fund versus cash.`}
    >
      {[0.5, 1].map((f) => {
        const y = PT + (1 - f) * CIH
        return (
          <g key={f}>
            <line x1={PL} y1={y} x2={PL + CIW} y2={y} stroke="var(--line)" strokeWidth="1" />
            <text x={PL + 2} y={y - 5} fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
              {fmtMoneyShort(f * yMax)}
            </text>
          </g>
        )
      })}
      {ticks.map((t, i) => (
        <text
          key={t}
          x={i === 0 ? PL : PL + (t / (n - 1)) * CIW}
          y={CH - 8}
          fill="var(--muted)"
          fontSize="11"
          fontFamily="var(--mono)"
          textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'}
        >
          {monthLabel(start + t)}
        </text>
      ))}
      <path d={linePath(series.contrib, yMax)} stroke="var(--muted)" strokeWidth="1.5" fill="none" strokeDasharray="2 4" />
      <path d={linePath(series.cash, yMax)} stroke="var(--s-cash)" strokeWidth="2" fill="none" strokeDasharray="6 5" strokeLinejoin="round" />
      <path d={linePath(series.stock, yMax)} stroke="var(--s-you)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <circle cx={PL + CIW} cy={endY(series.stock)} r="3.5" fill="var(--s-you)" stroke="var(--surface)" strokeWidth="2" />
      <circle cx={PL + CIW} cy={endY(series.cash)} r="3.5" fill="var(--s-cash)" stroke="var(--surface)" strokeWidth="2" />
      <text x={PL + CIW + 6} y={yStock + 4} fill="var(--s-you)" fontSize="11" fontFamily="var(--mono)" fontWeight="600">
        Invested
      </text>
      <text x={PL + CIW + 6} y={yCash + 4} fill="var(--s-cash)" fontSize="11" fontFamily="var(--mono)" fontWeight="600">
        Cash
      </text>
    </svg>
  )
}

/* ---------- the win wall ---------- */

function WinWall({
  horizon,
  selected,
  onSelect,
}: {
  horizon: Horizon
  selected: number
  onSelect: (s: number) => void
}) {
  const windows = computeWindows(horizon)
  const rows = Math.ceil(windows.length / 12)
  const CELL = 20
  const GAP = 3
  const LABEL_W = 44
  const w = LABEL_W + 12 * (CELL + GAP)
  const h = rows * (CELL + GAP)
  return (
    <div className="wall-scroll">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="group" aria-label="Every start month, colored by outcome. Click a square to inspect it.">
        {Array.from({ length: rows }).map((_, r) =>
          r % 5 === 0 ? (
            <text key={r} x={0} y={r * (CELL + GAP) + CELL - 5} fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
              {1995 + r}
            </text>
          ) : null,
        )}
        {windows.map((win) => {
          const status = windowStatus(win)
          const r = Math.floor(win.start / 12)
          const c = win.start % 12
          const isSel = win.start === selected
          return (
            <rect
              key={win.start}
              x={LABEL_W + c * (CELL + GAP)}
              y={r * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx="3"
              fill={STATUS_FILL[status]}
              stroke={isSel ? 'var(--gold-ui)' : 'var(--bg)'}
              strokeWidth={isSel ? 2.5 : 1}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(win.start)}
            >
              <title>
                {`Start ${monthLabel(win.start)} · ${(win.fvStock / win.contributed).toFixed(2)}× your money · ${STATUS_NAME[status]}`}
              </title>
            </rect>
          )
        })}
      </svg>
    </div>
  )
}

/* ---------- the screen ---------- */

export function ProofScreen({ onBack }: { onBack: () => void }) {
  const [horizon, setHorizon] = useState<Horizon>(180)
  const windows = useMemo(() => computeWindows(horizon), [horizon])
  const stats = useMemo(() => proofStats(windows), [windows])
  const [selected, setSelected] = useState<number>(() => proofStats(computeWindows(180)).worstIdx)

  const changeHorizon = (h: Horizon) => {
    setHorizon(h)
    setSelected(proofStats(computeWindows(h)).worstIdx) // always lead with the worst case
  }

  const sel = windows[Math.min(selected, windows.length - 1)]
  const selStatus = windowStatus(sel)
  const years = Math.round(horizon / 12)
  const counts = {
    win: stats.beatCash,
    lag: stats.count - stats.beatCash - stats.lostMoney,
    loss: stats.lostMoney,
  }

  return (
    <div className="proof">
      <p className="eyebrow">The Proof · no cherry-picking</p>
      <h1>Every start date since 1995. Tested.</h1>
      <p className="proof-dek">
        The biggest reason people never invest: <em>"what if I pick the wrong time?"</em>{' '}
        So we tested every time. $100 a month into an index fund, started at every
        possible month — including the eve of every crash — versus the same money in
        cash. Every square below is one start date. Click around.{' '}
        <strong>Try to find the bad time to have started.</strong>
      </p>

      <div className="horizon-row" role="group" aria-label="How long you stay invested">
        <span className="horizon-label">Stay invested for</span>
        {HORIZONS.map((h) => (
          <button
            key={h}
            className={'btn horizon-btn' + (horizon === h ? ' active' : '')}
            aria-pressed={horizon === h}
            onClick={() => changeHorizon(h)}
          >
            {h / 12} years
          </button>
        ))}
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="k">Beat cash</div>
          <div className="v">{stats.beatCash} of {stats.count}</div>
          <div className="d">{((100 * stats.beatCash) / stats.count).toFixed(1)}% of all start dates</div>
        </div>
        <div className="stat-tile">
          <div className="k">Lost money</div>
          <div className="v">{stats.lostMoney === 0 ? 'Zero' : stats.lostMoney}</div>
          <div className="d">{stats.lostMoney === 0 ? `no ${years}-year start ever has` : `${((100 * stats.lostMoney) / stats.count).toFixed(1)}% of start dates`}</div>
        </div>
        <div className="stat-tile">
          <div className="k">Median outcome</div>
          <div className="v">{stats.medianMultiple.toFixed(2)}×</div>
          <div className="d">your contributions, back</div>
        </div>
        <div className="stat-tile">
          <div className="k">Unluckiest start</div>
          <div className="v">{(windows[stats.worstIdx].fvStock / windows[stats.worstIdx].contributed).toFixed(2)}×</div>
          <div className="d">{monthLabel(windows[stats.worstIdx].start)}</div>
        </div>
      </div>

      <div className="legend">
        <span className="chip"><span className="dot-sw" style={{ background: STATUS_FILL.win }} /> Beat cash <span className="val">{counts.win}</span></span>
        <span className="chip"><span className="dot-sw" style={{ background: STATUS_FILL.lag }} /> Made money, trailed cash <span className="val">{counts.lag}</span></span>
        <span className="chip"><span className="dot-sw" style={{ background: STATUS_FILL.loss }} /> Lost money <span className="val">{counts.loss}</span></span>
      </div>
      <WinWall horizon={horizon} selected={sel.start} onSelect={setSelected} />

      <div className="principle proof-kicker">
        <p>{HORIZON_KICKER[horizon]}</p>
      </div>

      <section className="d-section">
        <h2>Under the microscope: {monthLabel(sel.start)}</h2>
        <p className="proof-selsum">
          {selected === stats.worstIdx && 'This is the worst possible start date — shown first on purpose. '}
          Start {monthLabel(sel.start)}, invest $100/month for {years} years: you put in{' '}
          <strong>{fmtMoney(sel.contributed)}</strong> and end with{' '}
          <strong>{fmtMoney(sel.fvStock)}</strong> ({(sel.fvStock / sel.contributed).toFixed(2)}×) —
          cash would hold {fmtMoney(sel.fvCash)}. Verdict: <strong>{STATUS_NAME[selStatus]}</strong>.
        </p>
        <div className="chart-wrap">
          <WindowChart start={sel.start} horizon={horizon} />
        </div>
        <div className="btn-row proof-nav">
          <button className="btn" onClick={() => setSelected(Math.max(0, selected - 1))} disabled={selected === 0}>
            ← Month earlier
          </button>
          <button className="btn" onClick={() => setSelected(Math.min(windows.length - 1, selected + 1))} disabled={selected === windows.length - 1}>
            Month later →
          </button>
          <button className="btn" onClick={() => setSelected(stats.worstIdx)}>Jump to worst</button>
          <button className="btn" onClick={() => setSelected(stats.bestIdx)}>Jump to best</button>
        </div>
      </section>

      <div className="btn-row proof-back">
        <button className="btn btn-primary" onClick={onBack}>I&apos;m convinced — let me play it</button>
      </div>

      <p className="footer-note">
        Cash = 3-month T-bills (a good savings account). Yearly market figures are real
        published totals; monthly paths within each year are stylized. Educational, not
        investment advice; the future is not required to repeat the past.
      </p>
    </div>
  )
}
