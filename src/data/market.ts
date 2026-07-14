// Stylized historical market data, Jan 1995 – Dec 2024 (360 months).
// Annual figures are real published totals (S&P 500 total return, US aggregate
// bonds, 3-month T-bills). Monthly paths use actual monthly shapes for the
// crash years that drive gameplay and a smooth deterministic wobble elsewhere,
// normalized so every year compounds to its true annual figure.
// v2 swap: replace with the Shiller monthly dataset.

export const START_YEAR = 1995
export const YEARS = 30
export const TOTAL_MONTHS = YEARS * 12

// S&P 500 total return, % per year
const STOCK_ANNUAL: Record<number, number> = {
  1995: 37.58, 1996: 22.96, 1997: 33.36, 1998: 28.58, 1999: 21.04,
  2000: -9.10, 2001: -11.89, 2002: -22.10, 2003: 28.68, 2004: 10.88,
  2005: 4.91, 2006: 15.79, 2007: 5.49, 2008: -37.00, 2009: 26.46,
  2010: 15.06, 2011: 2.11, 2012: 16.00, 2013: 32.39, 2014: 13.69,
  2015: 1.38, 2016: 11.96, 2017: 21.83, 2018: -4.38, 2019: 31.49,
  2020: 18.40, 2021: 28.71, 2022: -18.11, 2023: 26.29, 2024: 25.02,
}

// US aggregate bond total return, % per year
const BOND_ANNUAL: Record<number, number> = {
  1995: 18.47, 1996: 3.63, 1997: 9.65, 1998: 8.69, 1999: -0.82,
  2000: 11.63, 2001: 8.44, 2002: 10.26, 2003: 4.10, 2004: 4.34,
  2005: 2.43, 2006: 4.33, 2007: 6.97, 2008: 5.24, 2009: 5.93,
  2010: 6.54, 2011: 7.84, 2012: 4.22, 2013: -2.02, 2014: 5.97,
  2015: 0.55, 2016: 2.65, 2017: 3.54, 2018: 0.01, 2019: 8.72,
  2020: 7.51, 2021: -1.54, 2022: -13.01, 2023: 5.53, 2024: 1.25,
}

// 3-month T-bill (a good savings account), % per year
const CASH_ANNUAL: Record<number, number> = {
  1995: 5.60, 1996: 5.14, 1997: 5.19, 1998: 4.86, 1999: 4.68,
  2000: 5.89, 2001: 3.83, 2002: 1.65, 2003: 1.02, 2004: 1.20,
  2005: 2.98, 2006: 4.80, 2007: 4.66, 2008: 1.60, 2009: 0.10,
  2010: 0.12, 2011: 0.04, 2012: 0.06, 2013: 0.03, 2014: 0.03,
  2015: 0.05, 2016: 0.32, 2017: 0.93, 2018: 1.94, 2019: 2.06,
  2020: 0.35, 2021: 0.05, 2022: 2.02, 2023: 5.07, 2024: 5.25,
}

// Real (approximate) monthly S&P shapes for the years the game is about, % per month.
const STOCK_SHAPES: Record<number, number[]> = {
  1998: [1.0, 7.0, 5.0, 0.9, -1.9, 3.9, -1.2, -14.6, 6.2, 8.0, 5.9, 5.6],
  2001: [3.5, -9.2, -6.4, 7.7, 0.5, -2.5, -1.1, -6.4, -8.2, 1.8, 7.5, 0.8],
  2002: [-1.6, -2.1, 3.7, -6.1, -0.9, -7.2, -7.9, 0.5, -11.0, 8.6, 5.7, -6.0],
  2008: [-6.1, -3.5, -0.6, 4.8, 1.1, -8.6, -1.0, 1.2, -9.1, -16.9, -7.5, 0.8],
  2009: [-8.6, -10.9, 8.5, 9.4, 5.3, 0.2, 7.4, 3.4, 3.6, -1.9, 5.7, 1.9],
  2020: [-0.2, -8.4, -12.5, 12.7, 4.5, 1.8, 5.5, 7.0, -3.9, -2.8, 10.8, 3.7],
  2022: [-5.3, -3.1, 3.6, -8.8, 0.2, -8.4, 9.1, -4.2, -9.3, 8.0, 5.4, -5.9],
}

function normalizeToAnnual(monthly: number[], annualPct: number): number[] {
  const target = 1 + annualPct / 100
  const product = monthly.reduce((p, r) => p * (1 + r), 1)
  const adj = Math.pow(target / product, 1 / 12)
  return monthly.map((r) => (1 + r) * adj - 1)
}

function stockYear(year: number): number[] {
  const shape = STOCK_SHAPES[year]
  if (shape) return normalizeToAnnual(shape.map((p) => p / 100), STOCK_ANNUAL[year])
  const base = Math.pow(1 + STOCK_ANNUAL[year] / 100, 1 / 12) - 1
  const months: number[] = []
  for (let i = 0; i < 12; i++) {
    const wobble = 0.018 * Math.sin(year * 7.13 + i * 2.9) + 0.012 * Math.sin(year * 3.7 + i * 1.3)
    months.push(base + wobble)
  }
  return normalizeToAnnual(months, STOCK_ANNUAL[year])
}

function bondYear(year: number): number[] {
  const base = Math.pow(1 + BOND_ANNUAL[year] / 100, 1 / 12) - 1
  const months: number[] = []
  for (let i = 0; i < 12; i++) {
    months.push(base + 0.004 * Math.sin(year * 5.31 + i * 2.1))
  }
  return normalizeToAnnual(months, BOND_ANNUAL[year])
}

function cashYear(year: number): number[] {
  const base = Math.pow(1 + CASH_ANNUAL[year] / 100, 1 / 12) - 1
  return new Array(12).fill(base)
}

export interface MarketData {
  stocks: number[] // monthly decimal returns, length 360
  bonds: number[]
  cash: number[]
  stockIndex: number[] // cumulative growth index, length 361, [0] = 1
}

let cached: MarketData | null = null

export function getMarket(): MarketData {
  if (cached) return cached
  const stocks: number[] = []
  const bonds: number[] = []
  const cash: number[] = []
  for (let y = START_YEAR; y < START_YEAR + YEARS; y++) {
    stocks.push(...stockYear(y))
    bonds.push(...bondYear(y))
    cash.push(...cashYear(y))
  }
  const stockIndex = [1]
  for (let t = 0; t < TOTAL_MONTHS; t++) stockIndex.push(stockIndex[t] * (1 + stocks[t]))
  cached = { stocks, bonds, cash, stockIndex }
  return cached
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function monthLabel(t: number): string {
  const year = START_YEAR + Math.floor(t / 12)
  return `${MONTH_NAMES[t % 12]} ${year}`
}

export function yearOf(t: number): number {
  return START_YEAR + Math.floor(t / 12)
}
