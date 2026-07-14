import { useMemo, useState } from 'react'
import { eventMonths } from '../data/events'
import { fmtMoney } from '../engine/sim'
import { awardBadges, BADGES } from '../lib/badges'
import { downloadShareCard } from '../lib/sharecard'
import { RunChart, ChartLegend } from './RunChart'
import { RunResult } from './RunScreen'
import { Waitlist } from './Waitlist'
import { Term } from './Term'

const QUIZ = {
  question: 'Panic You ended with less money — in your own words, why?',
  options: [
    { text: 'They picked the wrong stocks and got unlucky with timing.', correct: false },
    {
      text: 'They sold when prices were low and bought back when prices were high — the growth happened while they were hiding in cash.',
      correct: true,
    },
    { text: "They didn't watch the market closely enough to react faster.", correct: false },
  ],
  reveal:
    'Exactly. Panic You never picked a bad investment — they held the same funds you did. The entire gap is behavior: selling low, rebuying high, and missing the recovery in between. The market charges admission, and the price is sitting through the drops.',
  revealWrong:
    "Not quite — Panic You held the exact same funds you did and watched the news plenty. The gap is behavior alone: they sold low, bought back high, and missed the recoveries in between. That's the whole lesson of the game.",
}

function verdictCopy(r: RunResult): string {
  const final = r.playerValues[r.playerValues.length - 1]
  const panicFinal = r.ghosts.panic[r.ghosts.panic.length - 1]
  const steadyFinal = r.ghosts.steady[r.ghosts.steady.length - 1]
  const sold = r.decisions.some((d) => d.choice === 'sell')

  if (r.endedInCash) {
    return `You sold and never got back in. Three decades later that caution cost you ${fmtMoney(
      steadyFinal - final,
    )} — not as a dramatic loss, but as growth that quietly happened to other people. That is how most real investing money is lost: not in crashes, but in the years spent hiding from them.`
  }
  if (!sold) {
    return `Thirty years, five crises, zero panic. You never sold — and that single behavior is worth ${fmtMoney(
      final - panicFinal,
    )} compared to the you who fled every crash. You didn't outsmart the market. You out-sat it.`
  }
  return `You sold at least once and found your way back in. The round trip cost you ${fmtMoney(
    Math.max(0, steadyFinal - final),
  )} compared to never touching it — tuition, paid to the market. Most people never learn this lesson with fake money. You just did.`
}

export function DebriefScreen({
  result,
  onReplay,
  onProof,
}: {
  result: RunResult
  onReplay: () => void
  onProof: () => void
}) {
  const final = result.playerValues[result.playerValues.length - 1]
  const panicFinal = result.ghosts.panic[result.ghosts.panic.length - 1]
  const cashFinal = result.ghosts.cashOnly[result.ghosts.cashOnly.length - 1]
  const [quizPick, setQuizPick] = useState<number | null>(null)

  const newBadges = useMemo(() => {
    const ids = ['firstRun']
    const sold = result.decisions.some((d) => d.choice === 'sell')
    const gfc = result.decisions.find((d) => d.eventId === 'gfc-2008')
    if (gfc && gfc.choice !== 'sell') ids.push('held2008')
    if (!sold) ids.push('ironHands')
    if (final > panicFinal) ids.push('beatPanic')
    return ids
  }, [result, final, panicFinal])

  const [earned, setEarned] = useState<Set<string>>(() => awardBadges(newBadges))

  const pickQuiz = (i: number) => {
    if (quizPick !== null) return
    setQuizPick(i)
    if (QUIZ.options[i].correct) setEarned(new Set(awardBadges(['graduate'])))
  }

  const series = { you: result.playerValues, panic: result.ghosts.panic, cash: result.ghosts.cashOnly }

  return (
    <div className="debrief">
      <p className="eyebrow">Debrief · December 2024</p>
      <h1>Thirty years. One habit.</h1>
      <p className="verdict">{verdictCopy(result)}</p>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="k"><span className="swatch" style={{ borderColor: 'var(--s-you)' }} />You</div>
          <div className="v">{fmtMoney(final)}</div>
          <div className="d">{fmtMoney(result.contributed)} contributed</div>
        </div>
        <div className="stat-tile">
          <div className="k"><span className="swatch" style={{ borderColor: 'var(--s-panic)' }} />Panic You</div>
          <div className="v">{fmtMoney(panicFinal)}</div>
          <div className="d">sold every crash</div>
        </div>
        <div className="stat-tile">
          <div className="k"><span className="swatch dashed" style={{ borderColor: 'var(--s-cash)' }} />Cash You</div>
          <div className="v">{fmtMoney(cashFinal)}</div>
          <div className="d">never invested</div>
        </div>
        <div className="stat-tile">
          <div className="k">Your edge over panic</div>
          <div className="v">{fmtMoney(Math.max(0, final - panicFinal))}</div>
          <div className="d">earned by sitting still</div>
        </div>
      </div>

      <ChartLegend finals={{ you: final, panic: panicFinal, cash: cashFinal }} />
      <RunChart series={series} eventTs={eventMonths} />

      <details className="data-table">
        <summary>View the numbers as a table</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Year end</th><th>You</th><th>Panic You</th><th>Cash You</th></tr>
            </thead>
            <tbody>
              {[1999, 2004, 2009, 2014, 2019, 2024].map((year) => {
                const t = (year - 1995) * 12 + 11
                return (
                  <tr key={year}>
                    <td>{year}</td>
                    <td>{fmtMoney(result.playerValues[t])}</td>
                    <td>{fmtMoney(result.ghosts.panic[t])}</td>
                    <td>{fmtMoney(result.ghosts.cashOnly[t])}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </details>

      <section className="d-section">
        <h2>Teach it back</h2>
        <p style={{ color: 'var(--ink-soft)', maxWidth: '38em' }}>{QUIZ.question}</p>
        {QUIZ.options.map((o, i) => (
          <button
            key={i}
            className={
              'quiz-opt' +
              (quizPick !== null && o.correct ? ' correct' : '') +
              (quizPick === i && !o.correct ? ' wrong' : '')
            }
            onClick={() => pickQuiz(i)}
            disabled={quizPick !== null}
          >
            {o.text}
          </button>
        ))}
        {quizPick !== null && (
          <p className="quiz-reveal">
            {QUIZ.options[quizPick].correct ? QUIZ.reveal : QUIZ.revealWrong}
          </p>
        )}
      </section>

      <section className="d-section">
        <h2>Badges</h2>
        <div className="badge-row">
          {BADGES.map((b) => (
            <div key={b.id} className={'badge' + (earned.has(b.id) ? ' earned' : '')}>
              <div className="b-name">{b.name}</div>
              <div className="b-how">{b.how}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="d-section">
        <h2>Take it with you</h2>
        <div className="btn-row">
          <button className="btn" onClick={() => downloadShareCard(result)}>Download your run card</button>
          <button className="btn btn-primary" onClick={onReplay}>Run it again — choose differently</button>
        </div>
      </section>

      <section className="d-section">
        <h2>Still second-guessing?</h2>
        <p style={{ color: 'var(--ink-soft)', maxWidth: '38em' }}>
          One run is a story. Here is the census: every possible start date since 1995,
          tested against cash — the losing ones included.
        </p>
        <div className="btn-row">
          <button className="btn" onClick={onProof}>Open The Proof</button>
        </div>
      </section>

      <section className="d-section">
        <h2>Ready for the real thing?</h2>
        <Waitlist />
      </section>

      <p className="footer-note">
        The Long Game is an educational simulation. The yearly market figures are real
        published totals; monthly paths are stylized. It is not investment advice, no
        specific product is recommended, and past performance — even thirty years of
        it — does not guarantee future results. <Term>Compounding</Term> is patient;
        so is the <Term k="expense ratio">fine print</Term>.
      </p>
    </div>
  )
}
