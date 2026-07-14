import { useMemo, useState } from 'react'
import { fmtMoney } from '../engine/sim'
import { quickWindows } from '../engine/proof'

// "I don't have time" — the whole strategy in three moves, plus a projector.
// The numbers are not a made-up rate: every figure is computed from every real
// start month since 1995 (median, worst, best), same engine as The Proof.

const FUNDS = [
  {
    ticker: 'FZROX',
    name: 'Fidelity ZERO Total Market Index',
    fee: '0.00% fee',
    owns: 'the entire US stock market',
  },
  {
    ticker: 'FXAIX',
    name: 'Fidelity 500 Index',
    fee: '0.015% fee',
    owns: 'the S&P 500 — the 500 biggest US companies',
  },
  {
    ticker: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    fee: '0.03% fee',
    owns: 'the entire US stock market',
  },
  {
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    fee: '0.03% fee',
    owns: 'the S&P 500 — the 500 biggest US companies',
  },
]

const ROWS = [
  { h: 12, label: 'In 1 year' },
  { h: 24, label: 'In 2 years' },
  { h: 60, label: 'In 5 years' },
  { h: 120, label: 'In 10 years' },
]

export function QuickScreen({ onProof, onBack }: { onProof: () => void; onBack: () => void }) {
  const [start, setStart] = useState(1000)
  const [monthly, setMonthly] = useState(100)

  const rows = useMemo(
    () =>
      ROWS.map(({ h, label }) => {
        const finals = quickWindows(h)
          .map((w) => start * w.lumpMult + monthly * w.annuity)
          .sort((a, b) => a - b)
        return {
          label,
          contributed: start + monthly * h,
          worst: finals[0],
          median: finals[Math.floor(finals.length / 2)],
          best: finals[finals.length - 1],
        }
      }),
    [start, monthly],
  )

  return (
    <div className="quick">
      <p className="eyebrow">I don&apos;t have time · the shortcut</p>
      <h1>The whole strategy, in three moves.</h1>
      <p className="proof-dek">
        You don&apos;t need to watch markets, read charts, or pick winning stocks. People
        who don&apos;t have time buy one broad index fund, automate a deposit, and leave
        it alone. That is the entire move — here is what it looks like.
      </p>

      <section className="d-section">
        <h2>Do this once</h2>
        <ol className="quick-steps">
          <li>Open a brokerage account — Fidelity, Vanguard, or Schwab. About ten minutes.</li>
          <li>Buy <strong>one</strong> broad index fund. Any of the four below — they all do the same job.</li>
          <li>Set an automatic monthly deposit. Then stop looking. Seriously.</li>
        </ol>
      </section>

      <section className="d-section">
        <h2>One boring fund is enough</h2>
        <div className="fund-grid">
          {FUNDS.map((f) => (
            <div className="fund-card" key={f.ticker}>
              <div className="fund-tick">{f.ticker}</div>
              <div className="fund-name">{f.name}</div>
              <div className="fund-meta">{f.fee} · owns {f.owns}</div>
            </div>
          ))}
        </div>
        <p className="fund-note">
          These are educational examples of the broad, low-cost index funds people most
          commonly use — not a recommendation of any product. The pick matters far less
          than the starting.
        </p>
      </section>

      <section className="d-section">
        <h2>
          What {fmtMoney(start)}
          {monthly > 0 && <> + {fmtMoney(monthly)}/month</>} turns into
        </h2>
        <div className="sliders">
          <div className="slider-row">
            <label htmlFor="q-start">
              Start with <strong>{fmtMoney(start)}</strong>
            </label>
            <input
              id="q-start"
              type="range"
              min={100}
              max={10000}
              step={100}
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
            />
          </div>
          <div className="slider-row">
            <label htmlFor="q-monthly">
              Add <strong>{fmtMoney(monthly)}</strong> every month
            </label>
            <input
              id="q-monthly"
              type="range"
              min={0}
              max={1000}
              step={25}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="stat-row">
          {rows.map((r) => (
            <div className="stat-tile" key={r.label}>
              <div className="k">{r.label}</div>
              <div className="v">≈{fmtMoney(r.median)}</div>
              <div className="d">worst {fmtMoney(r.worst)} · best {fmtMoney(r.best)}</div>
              <div className="d">you put in {fmtMoney(r.contributed)}</div>
            </div>
          ))}
        </div>
        <p className="quick-note">
          Not a made-up growth rate: each figure is the median outcome across every
          possible start month since 1995 in the S&amp;P 500, with the full worst-to-best
          range shown. The low end is real — start a short window into a crash and you
          can end below what you put in. That risk fades with years; by fifteen it has
          never happened.
        </p>
      </section>

      <div className="btn-row proof-back">
        <button className="btn btn-primary" onClick={onProof}>
          See every start date tested — The Proof
        </button>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>

      <p className="footer-note">
        Educational, not investment advice. Fund examples are illustrative; check current
        fees before buying anything. Past performance — even thirty years of it — does
        not guarantee future results.
      </p>
    </div>
  )
}
