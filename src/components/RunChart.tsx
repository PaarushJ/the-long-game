import { useCallback, useRef, useState } from 'react'
import { monthLabel, TOTAL_MONTHS } from '../data/market'
import { fmtMoney, fmtMoneyShort } from '../engine/sim'

const W = 720
const H = 320
const PAD_L = 10
const PAD_R = 96
const PAD_T = 16
const PAD_B = 30
const IW = W - PAD_L - PAD_R
const IH = H - PAD_T - PAD_B

const CEILINGS = [
  500, 1000, 2500, 5000, 10000, 20000, 30000, 50000, 75000, 100000,
  150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000,
]

function niceCeil(v: number): number {
  for (const c of CEILINGS) if (c >= v) return c
  return CEILINGS[CEILINGS.length - 1]
}

export interface ChartSeries {
  you: number[]
  panic: number[]
  cash: number[]
}

interface Props {
  series: ChartSeries
  eventTs: number[]
  interactive?: boolean
}

const COLORS = { you: 'var(--s-you)', panic: 'var(--s-panic)', cash: 'var(--s-cash)' }
const NAMES = { you: 'You', panic: 'Panic You', cash: 'Cash You' }

function pathFor(values: number[], yMax: number): string {
  if (values.length === 0) return ''
  const pts: string[] = []
  for (let t = 0; t < values.length; t++) {
    const x = PAD_L + (t / (TOTAL_MONTHS - 1)) * IW
    const y = PAD_T + (1 - values[t] / yMax) * IH
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return 'M' + pts.join('L')
}

/** Push apart overlapping end-labels (min 15px separation). */
function spreadLabels(entries: { key: keyof ChartSeries; y: number }[]): Record<string, number> {
  const sorted = [...entries].sort((a, b) => a.y - b.y)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].y - sorted[i - 1].y < 15) sorted[i].y = sorted[i - 1].y + 15
  }
  const out: Record<string, number> = {}
  sorted.forEach((e) => (out[e.key] = Math.min(e.y, PAD_T + IH)))
  return out
}

export function RunChart({ series, eventTs, interactive = true }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ t: number; px: number; py: number } | null>(null)

  const n = series.you.length
  const maxVal = Math.max(
    10,
    ...series.you.slice(0, n),
    ...series.panic.slice(0, n),
    ...series.cash.slice(0, n),
  )
  const yMax = niceCeil(maxVal * 1.12)

  const onMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (!interactive || n === 0) return
      const svg = (e.target as SVGRectElement).ownerSVGElement
      const wrap = wrapRef.current
      if (!svg || !wrap) return
      const rect = svg.getBoundingClientRect()
      const fx = ((e.clientX - rect.left) / rect.width) * W
      let t = Math.round(((fx - PAD_L) / IW) * (TOTAL_MONTHS - 1))
      t = Math.max(0, Math.min(n - 1, t))
      const wrapRect = wrap.getBoundingClientRect()
      setHover({ t, px: e.clientX - wrapRect.left, py: e.clientY - wrapRect.top })
    },
    [interactive, n],
  )

  const gridVals = [0.25, 0.5, 0.75, 1].map((f) => f * yMax)
  const lastYs = (['you', 'panic', 'cash'] as const)
    .filter((k) => series[k].length > 0)
    .map((k) => ({ key: k, y: PAD_T + (1 - series[k][n - 1] / yMax) * IH }))
  const labelY = spreadLabels(lastYs)
  const endX = n > 0 ? PAD_L + ((n - 1) / (TOTAL_MONTHS - 1)) * IW : PAD_L

  const hoverX = hover ? PAD_L + (hover.t / (TOTAL_MONTHS - 1)) * IW : 0
  const tipLeft = hover ? (hover.px > (wrapRef.current?.clientWidth ?? 600) * 0.6 ? hover.px - 190 : hover.px + 16) : 0

  return (
    <div className="chart-wrap" ref={wrapRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Portfolio value over 30 years: you versus your panic ghost and cash ghost.">
        {/* grid */}
        {gridVals.map((v) => {
          const y = PAD_T + (1 - v / yMax) * IH
          return (
            <g key={v}>
              <line x1={PAD_L} y1={y} x2={PAD_L + IW} y2={y} stroke="var(--line)" strokeWidth="1" />
              <text x={PAD_L + IW + 6} y={y + 4} fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
                {fmtMoneyShort(v)}
              </text>
            </g>
          )
        })}
        {/* year ticks */}
        {[0, 60, 120, 180, 240, 300, 359].map((t) => {
          const x = PAD_L + (t / (TOTAL_MONTHS - 1)) * IW
          return (
            <text key={t} x={t === 0 ? PAD_L : x} y={H - 8} fill="var(--muted)" fontSize="11" fontFamily="var(--mono)" textAnchor={t === 0 ? 'start' : 'middle'}>
              {1995 + Math.round(t / 12)}
            </text>
          )
        })}
        {/* event markers */}
        {eventTs.filter((t) => t < n).map((t) => {
          const x = PAD_L + (t / (TOTAL_MONTHS - 1)) * IW
          return <line key={t} x1={x} y1={PAD_T + IH - 6} x2={x} y2={PAD_T + IH + 5} stroke="var(--s-panic)" strokeWidth="2" />
        })}
        {/* hover crosshair */}
        {hover && <line x1={hoverX} y1={PAD_T} x2={hoverX} y2={PAD_T + IH} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />}
        {/* series: cash dashed (identity is never color-alone), ghosts 2px, player 2.5px */}
        <path d={pathFor(series.cash, yMax)} className="line-cash" stroke={COLORS.cash} strokeWidth="2" fill="none" strokeDasharray="6 5" strokeLinejoin="round" />
        <path d={pathFor(series.panic, yMax)} stroke={COLORS.panic} strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d={pathFor(series.you, yMax)} stroke={COLORS.you} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        {/* endpoint dots + direct labels */}
        {n > 0 &&
          (['cash', 'panic', 'you'] as const).map((k) => (
            <g key={k}>
              <circle cx={endX} cy={PAD_T + (1 - series[k][n - 1] / yMax) * IH} r="3.5" fill={COLORS[k]} stroke="var(--surface)" strokeWidth="2" />
              <text x={Math.min(endX + 8, PAD_L + IW + 6)} y={labelY[k] + 4} fill={COLORS[k]} fontSize="11" fontFamily="var(--mono)" fontWeight="600">
                {NAMES[k]}
              </text>
            </g>
          ))}
        {interactive && (
          <rect
            x={PAD_L} y={PAD_T} width={IW} height={IH}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        )}
      </svg>
      {hover && (
        <div className="chart-tip" style={{ left: tipLeft, top: Math.max(10, hover.py - 70) }}>
          <div className="tt-date">{monthLabel(hover.t)}</div>
          {(['you', 'panic', 'cash'] as const).map((k) => (
            <div key={k}>
              <span className="dot" style={{ background: COLORS[k] }} />
              {NAMES[k]} {fmtMoney(series[k][Math.min(hover.t, series[k].length - 1)] ?? 0)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChartLegend({ finals }: { finals?: { you: number; panic: number; cash: number } }) {
  return (
    <div className="legend" aria-hidden="false">
      <span className="chip"><span className="swatch" style={{ borderColor: 'var(--s-you)' }} /> You {finals && <span className="val">{fmtMoney(finals.you)}</span>}</span>
      <span className="chip"><span className="swatch" style={{ borderColor: 'var(--s-panic)' }} /> Panic You {finals && <span className="val">{fmtMoney(finals.panic)}</span>}</span>
      <span className="chip"><span className="swatch dashed" style={{ borderColor: 'var(--s-cash)' }} /> Cash You {finals && <span className="val">{fmtMoney(finals.cash)}</span>}</span>
    </div>
  )
}
