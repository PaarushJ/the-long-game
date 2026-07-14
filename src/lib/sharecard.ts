import { RunResult } from '../components/RunScreen'
import { fmtMoney } from '../engine/sim'

/** Draw the end-of-run share card and trigger a PNG download. */
export function downloadShareCard(result: RunResult) {
  const W = 1200
  const H = 630
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#0b1613'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#e3b341'
  ctx.font = '600 22px Menlo, monospace'
  ctx.fillText('THE LONG GAME', 64, 78)
  ctx.fillStyle = '#8fa098'
  ctx.font = '20px Menlo, monospace'
  ctx.fillText('$100/month through 30 years of real market history', 64, 112)

  // chart area
  const cx = 64
  const cy = 150
  const cw = W - 128
  const ch = 320
  const n = result.playerValues.length
  const maxV = Math.max(...result.playerValues, ...result.ghosts.panic, ...result.ghosts.cashOnly)

  const drawLine = (vals: number[], color: string, width: number, dash: number[]) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.setLineDash(dash)
    ctx.beginPath()
    for (let t = 0; t < n; t += 2) {
      const x = cx + (t / (n - 1)) * cw
      const y = cy + ch - (vals[t] / maxV) * ch
      if (t === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.strokeStyle = '#24382f'
  ctx.lineWidth = 1
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath()
    ctx.moveTo(cx, cy + (ch / 4) * i)
    ctx.lineTo(cx + cw, cy + (ch / 4) * i)
    ctx.stroke()
  }

  drawLine(result.ghosts.cashOnly, '#3987e5', 3, [10, 8])
  drawLine(result.ghosts.panic, '#e66767', 3, [])
  drawLine(result.playerValues, '#c98500', 5, [])

  const finals: [string, number, string][] = [
    ['You', result.playerValues[n - 1], '#c98500'],
    ['Panic You', result.ghosts.panic[n - 1], '#e66767'],
    ['Cash You', result.ghosts.cashOnly[n - 1], '#3987e5'],
  ]
  let fx = 64
  finals.forEach(([name, v, color]) => {
    ctx.fillStyle = color
    ctx.font = '600 18px Menlo, monospace'
    ctx.fillText(String(name).toUpperCase(), fx, 540)
    ctx.fillStyle = '#e7ece6'
    ctx.font = '600 40px Menlo, monospace'
    ctx.fillText(fmtMoney(Number(v)), fx, 585)
    fx += 380
  })

  const link = document.createElement('a')
  link.download = 'the-long-game-run.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}
