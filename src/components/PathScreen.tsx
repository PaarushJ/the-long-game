interface Props {
  onLongTerm: () => void
  onLearn: () => void
  onQuick: () => void
  onHome: () => void
}

export function PathScreen({ onLongTerm, onLearn, onQuick, onHome }: Props) {
  return (
    <div className="slide">
      <p className="eyebrow">Start learning</p>
      <h2>How much time are you bringing?</h2>
      <p className="slide-body">
        Same destination — a boring portfolio you never panic about — three doors in,
        depending on the time you actually have.
      </p>
      <div className="path-grid">
        <button className="path-card" onClick={onLongTerm}>
          <h3>Long term</h3>
          <p>
            Play the full simulator: pick your mix, live through 1995–2024 with every
            crash, and make the hold-or-sell calls yourself.
          </p>
          <span className="path-go">Play the simulator →</span>
        </button>
        <button className="path-card" onClick={onLearn}>
          <h3>I want to invest my time into learning investing</h3>
          <p>
            Lessons first: what a share actually is, what an index fund owns, why prices
            scream — then the proof that timing barely matters.
          </p>
          <span className="path-go">Start Chapter 1 →</span>
        </button>
        <button className="path-card" onClick={onQuick}>
          <h3>I don&apos;t have time</h3>
          <p>
            The honest shortcut: the kind of fund people actually use, and what $1,000
            plus patience has historically turned into.
          </p>
          <span className="path-go">Show me →</span>
        </button>
      </div>
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onHome}>← Back to the race</button>
      </div>
    </div>
  )
}
