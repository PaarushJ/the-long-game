import { useState } from 'react'
import { Allocation } from '../engine/sim'
import { Term } from './Term'

export interface Preset {
  id: string
  name: string
  mix: string
  alloc: Allocation
  blurb: string
}

export const PRESETS: Preset[] = [
  {
    id: 'bold',
    name: 'Bold',
    mix: '90% stocks · 10% bonds',
    alloc: { stocks: 0.9, bonds: 0.1, cash: 0 },
    blurb: 'Biggest long-run growth, wildest ride. The crashes will hit hardest here.',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    mix: '70% stocks · 25% bonds · 5% cash',
    alloc: { stocks: 0.7, bonds: 0.25, cash: 0.05 },
    blurb: 'The classic middle path. Bonds soften the drops; you give up some upside.',
  },
  {
    id: 'cautious',
    name: 'Cautious',
    mix: '50% stocks · 40% bonds · 10% cash',
    alloc: { stocks: 0.5, bonds: 0.4, cash: 0.1 },
    blurb: 'Smoothest ride, slowest growth. Even this one is mostly not "safe" cash.',
  },
]

const BAR_COLORS = { stocks: 'var(--s-you)', bonds: 'var(--ink-soft)', cash: 'var(--s-cash)' }

export function SetupScreen({ onStart }: { onStart: (p: Preset) => void }) {
  const [sel, setSel] = useState<string>('balanced')
  const chosen = PRESETS.find((p) => p.id === sel)!
  return (
    <div className="slide">
      <p className="eyebrow">Setup — the only decision you get</p>
      <h2>Pick your mix. Then the machine takes over.</h2>
      <p className="slide-body">
        $100 a month goes in automatically — your <Term>contribution</Term> — split
        between an <Term>index fund</Term>, <Term k="bonds">bonds</Term>, and cash.
        There is nothing else to configure. That&apos;s the point.
      </p>
      <div className="alloc-grid">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className={'alloc-card' + (sel === p.id ? ' selected' : '')}
            onClick={() => setSel(p.id)}
            aria-pressed={sel === p.id}
          >
            <h3>{p.name}</h3>
            <div className="mix">{p.mix}</div>
            <p>{p.blurb}</p>
            <div className="alloc-bar" aria-hidden="true">
              {(['stocks', 'bonds', 'cash'] as const).map(
                (k) =>
                  p.alloc[k] > 0 && (
                    <span key={k} style={{ width: `${p.alloc[k] * 100}%`, background: BAR_COLORS[k] }} />
                  ),
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => onStart(chosen)}>
          Begin: January 1995 →
        </button>
      </div>
    </div>
  )
}
