import { useState } from 'react'
import { Term } from './Term'

/* Chapter 1: What you actually own. Four slides, each with a simple diagram. */

function SliceArt() {
  return (
    <svg viewBox="0 0 360 180" width="360" height="180">
      <circle cx="90" cy="90" r="64" fill="var(--surface-3)" stroke="var(--line)" strokeWidth="1.5" />
      {/* one highlighted slice */}
      <path d="M90,90 L90,26 A64,64 0 0 1 129,39 Z" fill="var(--gold-ui)" />
      <text x="90" y="168" textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">one company</text>
      <text x="250" y="80" fill="var(--ink)" fontSize="15" fontFamily="var(--serif)">1 share =</text>
      <text x="250" y="102" fill="var(--ink-soft)" fontSize="15" fontFamily="var(--serif)">a real slice of it</text>
    </svg>
  )
}

function GridArt() {
  const cells = []
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 25; c++) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={20 + c * 13}
          y={16 + r * 13}
          width="10"
          height="10"
          rx="1.5"
          fill={(r * 25 + c) % 37 === 0 ? 'var(--gold-ui)' : 'var(--surface-3)'}
          stroke="var(--line)"
          strokeWidth="0.5"
        />,
      )
    }
  }
  return (
    <svg viewBox="0 0 360 170" width="360" height="170">
      {cells}
      <text x="180" y="162" textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">
        250 shown · the real fund holds ~500
      </text>
    </svg>
  )
}

function NoiseArt() {
  return (
    <svg viewBox="0 0 360 180" width="360" height="180">
      <polyline
        points="20,60 45,38 70,72 95,50 120,88 145,58 170,95 195,66 220,44 245,78 270,52 295,70 320,40 340,55"
        fill="none" stroke="var(--s-panic)" strokeWidth="2" strokeLinejoin="round"
      />
      <text x="20" y="26" fill="var(--s-panic)" fontSize="12" fontFamily="var(--mono)">the price (screaming)</text>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={24 + i * 46} y={122} width="36" height="30" rx="2" fill="var(--surface-3)" stroke="var(--line)" />
      ))}
      <text x="20" y="172" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">the companies (still open for business)</text>
    </svg>
  )
}

function PlanArt() {
  return (
    <svg viewBox="0 0 360 180" width="360" height="180">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <g key={i}>
          <rect x={22 + i * 27} y={140 - i * 7} width="20" height={20 + i * 7} rx="2" fill={i === 11 ? 'var(--gold-ui)' : 'var(--surface-3)'} stroke="var(--line)" />
        </g>
      ))}
      <text x="180" y="172" textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">
        $100 in, every month, no matter the headlines
      </text>
    </svg>
  )
}

const SLIDES = [
  {
    title: 'A share is a slice of a real business',
    body: (
      <>
        When you buy a share, you own a piece of an actual company — its stores, its
        patents, its profits. Not a lottery ticket. A deed.
      </>
    ),
    art: <SliceArt />,
  },
  {
    title: 'An index fund is five hundred slices at once',
    body: (
      <>
        One purchase, one <Term>index fund</Term>, and you own a sliver of the ~500
        biggest companies in America. That&apos;s <Term>diversification</Term>: no
        single company&apos;s failure can take you down.
      </>
    ),
    art: <GridArt />,
  },
  {
    title: 'Prices scream. Companies persist.',
    body: (
      <>
        "The market fell 3%" only means buyers are offering less <em>today</em>. The
        companies you own didn&apos;t vanish. That bouncing is <Term>volatility</Term> —
        the toll you pay for growth, not the same thing as losing money.
      </>
    ),
    art: <NoiseArt />,
  },
  {
    title: 'Your whole plan fits in one sentence',
    body: (
      <>
        Buy slices every month, automatically, and ignore the screaming. The pros call
        it <Term k="dollar-cost averaging">dollar-cost averaging</Term>. You&apos;re
        about to feel why it works.
      </>
    ),
    art: <PlanArt />,
  },
]

export function Chapter1({
  onDone,
  doneLabel = 'Enter the simulator',
}: {
  onDone: () => void
  doneLabel?: string
}) {
  const [i, setI] = useState(0)
  const slide = SLIDES[i]
  const last = i === SLIDES.length - 1
  return (
    <div className="slide">
      <p className="slide-progress">CHAPTER 1 · {i + 1} / {SLIDES.length}</p>
      <h2>{slide.title}</h2>
      <p className="slide-body">{slide.body}</p>
      <div className="slide-art">{slide.art}</div>
      <div className="btn-row">
        {i > 0 && (
          <button className="btn btn-ghost" onClick={() => setI(i - 1)}>Back</button>
        )}
        <button className="btn btn-primary" onClick={() => (last ? onDone() : setI(i + 1))}>
          {last ? doneLabel : 'Next'}
        </button>
      </div>
    </div>
  )
}
