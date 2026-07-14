// The five scripted crisis events. Month index t counts from Jan 1995 = 0.
// The pause happens AFTER month t's return is applied — the player has already
// eaten the drop when they decide, exactly like real life.

export interface CrisisEvent {
  id: string
  t: number
  dateLabel: string
  kicker: string
  headline: string
  body: string
  coachNote: string
}

export const EVENTS: CrisisEvent[] = [
  {
    id: 'ltcm-1998',
    t: 43, // Aug 1998
    dateLabel: 'August 1998',
    kicker: 'Breaking',
    headline: 'Russia defaults. A giant hedge fund is imploding.',
    body:
      'Stocks just fell 14% in a single month. The news says the global financial system is "under severe stress." Your friends are talking about pulling their money out.',
    coachNote:
      'First crash. Notice the feeling — that pit in your stomach is the thing this game exists to train. The question is never "will it drop?" It always will. The question is what you do next.',
  },
  {
    id: 'dotcom-2001',
    t: 80, // Sep 2001
    dateLabel: 'September 2001',
    kicker: 'Bear market',
    headline: 'After the 9/11 attacks, markets reopen to steep losses.',
    body:
      'The dot-com bubble had already been deflating for eighteen months, and now the country is grieving and afraid. The market is down roughly 30% from its peak. Recession is here.',
    coachNote:
      'This one is long and slow — the grind hurts differently than the plunge. Remember what you own: pieces of hundreds of real companies that are still open for business.',
  },
  {
    id: 'gfc-2008',
    t: 165, // Oct 2008
    dateLabel: 'October 2008',
    kicker: 'Crisis',
    headline: 'Banks are failing. This is the worst crash since 1929.',
    body:
      'Lehman Brothers is gone. The market fell 17% this month alone and nobody on television believes it is over. People near retirement have lost decades of savings on paper.',
    coachNote:
      'This is the final exam. In the real 2008, investors who sold locked in the loss; the market bottomed five months later and then more than tripled over the next decade. Nobody rang a bell at the bottom.',
  },
  {
    id: 'covid-2020',
    t: 302, // Mar 2020
    dateLabel: 'March 2020',
    kicker: 'Pandemic',
    headline: 'A virus has shut down the world economy.',
    body:
      'The fastest 30% drop in stock market history — five weeks. Cities are locked down, planes are grounded, and this time genuinely nobody knows what happens next.',
    coachNote:
      '"This time it\'s different" is the most expensive sentence in investing. Every crash feels unprecedented while it is happening. That is what makes them crashes.',
  },
  {
    id: 'inflation-2022',
    t: 332, // Sep 2022
    dateLabel: 'September 2022',
    kicker: 'Inflation',
    headline: 'Inflation hits a 40-year high. Stocks AND bonds are falling.',
    body:
      'The classic safety valve failed — bonds are down double digits alongside stocks. Cash in a savings account is losing 8% a year to inflation. There is nowhere comfortable to stand.',
    coachNote:
      'The sneaky lesson of 2022: "safe" cash quietly lost buying power too. Risk never disappears — it only changes shape.',
  },
]

export const eventMonths = EVENTS.map((e) => e.t)

export interface ReentryPrompt {
  headline: string
  body: string
}

export const REENTRY_PROMPTS: ReentryPrompt[] = [
  {
    headline: 'Markets have rallied 25% since you sold.',
    body: 'The headlines have turned optimistic. Prices are now higher than where you got out. Your money has been sitting in cash.',
  },
  {
    headline: 'The rally kept going. Stocks are up over 55% off your exit.',
    body: 'Every month in cash, your contributions bought no shares of anything. The recovery is happening without you.',
  },
  {
    headline: 'Still out. The market has nearly doubled since you sold.',
    body: 'This is the quiet cost nobody puts on TV: not a dramatic loss, just growth that happened to other people.',
  },
]

// Non-blocking coach lines that appear as the years roll by.
export const COACH_TICKS: Record<number, string> = {
  11: 'One year in. $1,200 contributed. Boring, right? Boring is the strategy.',
  59: 'Five years. Look at the gap opening between you and Cash You — that gap is compounding, not luck.',
  119: 'Ten years in. You have now lived through two crashes. Notice the line still points up-and-to-the-right.',
  239: 'Twenty years. The money your money earned is now earning money. This is the part nobody feels in their gut until they see it.',
  341: 'Almost there. Three decades, five crises, one $100-a-month habit.',
}
