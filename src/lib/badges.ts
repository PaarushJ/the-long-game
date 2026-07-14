export interface Badge {
  id: string
  name: string
  how: string
}

export const BADGES: Badge[] = [
  { id: 'firstRun', name: 'Time Traveler', how: 'Complete your first 30-year run' },
  { id: 'held2008', name: 'Held Through 2008', how: 'Hold or buy during the worst crash since 1929' },
  { id: 'ironHands', name: 'Iron Hands', how: 'Finish a run without selling once' },
  { id: 'beatPanic', name: 'Beat Your Panic', how: 'End a run with more money than Panic You' },
  { id: 'graduate', name: 'Graduate', how: 'Explain the lesson back in your own words' },
]

const KEY = 'tlg.badges.v1'

export function earnedBadges(): Set<string> {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

export function awardBadges(ids: string[]): Set<string> {
  const earned = earnedBadges()
  ids.forEach((id) => earned.add(id))
  try {
    localStorage.setItem(KEY, JSON.stringify([...earned]))
  } catch {
    // storage unavailable (private mode) — badges just don't persist
  }
  return earned
}
