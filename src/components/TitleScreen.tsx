interface Props {
  onChapter: () => void
  onSkip: () => void
}

export function TitleScreen({ onChapter, onSkip }: Props) {
  return (
    <div className="title-screen">
      <p className="eyebrow">A flight simulator for investing</p>
      <h1>The Long Game</h1>
      <p className="dek">
        Live through thirty years of real market history in about ten minutes — crashes
        included. Two ghosts run beside you the whole way: the you who panics, and the
        you who never invests at all.
      </p>
      <p className="title-rules">$100/month · 1995–2024 · fake money, real history, real feelings</p>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onChapter}>
          Start with Chapter 1 — What you actually own
        </button>
        <button className="btn btn-ghost" onClick={onSkip}>
          Skip straight to the simulator
        </button>
      </div>
    </div>
  )
}
