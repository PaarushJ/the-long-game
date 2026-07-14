import { CrisisEvent, ReentryPrompt } from '../data/events'
import { fmtMoney } from '../engine/sim'

export type EventChoice = 'hold' | 'sell' | 'buyMore'

interface EventProps {
  event: CrisisEvent
  value: number
  drawdownPct: number
  onChoose: (c: EventChoice) => void
}

export function EventModal({ event, value, drawdownPct, onChoose }: EventProps) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="ev-h">
      <div className="event-card">
        <p className="kicker">{event.kicker} · {event.dateLabel}</p>
        <h2 id="ev-h">{event.headline}</h2>
        <p className="ev-body">{event.body}</p>
        <div className="event-stat">
          Your account: {fmtMoney(value)}
          {drawdownPct < -0.5 && (
            <>
              {' '}· <span className="down">{drawdownPct.toFixed(0)}% from its peak</span>
            </>
          )}
        </div>
        <div className="ev-coach">
          <span className="who">Coach</span>
          <span className="msg">{event.coachNote}</span>
        </div>
        <div className="choice-col">
          <button className="choice" onClick={() => onChoose('hold')}>
            <span className="c-title">Hold steady</span>
            <span className="c-sub">Do nothing. The $100 keeps going in every month.</span>
          </button>
          <button className="choice" onClick={() => onChoose('buyMore')}>
            <span className="c-title">Buy the dip</span>
            <span className="c-sub">Push your $500 rainy-day stash in while everything is on sale.</span>
          </button>
          <button className="choice" onClick={() => onChoose('sell')}>
            <span className="c-title">Sell everything</span>
            <span className="c-sub">Move it all to cash until this blows over.</span>
          </button>
        </div>
      </div>
    </div>
  )
}

interface ReentryProps {
  prompt: ReentryPrompt
  onChoose: (reenter: boolean) => void
}

export function ReentryModal({ prompt, onChoose }: ReentryProps) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="re-h">
      <div className="event-card">
        <p className="kicker calm">Meanwhile, in cash</p>
        <h2 id="re-h">{prompt.headline}</h2>
        <p className="ev-body">{prompt.body}</p>
        <div className="choice-col">
          <button className="choice" onClick={() => onChoose(true)}>
            <span className="c-title">Get back in</span>
            <span className="c-sub">Return to your original mix — at today&apos;s higher prices.</span>
          </button>
          <button className="choice" onClick={() => onChoose(false)}>
            <span className="c-title">Stay in cash</span>
            <span className="c-sub">It still doesn&apos;t feel safe yet.</span>
          </button>
        </div>
      </div>
    </div>
  )
}
