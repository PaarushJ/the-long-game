import { useState } from 'react'
import { TitleScreen } from './components/TitleScreen'
import { Chapter1 } from './components/Chapter1'
import { SetupScreen, Preset } from './components/SetupScreen'
import { RunScreen, RunResult } from './components/RunScreen'
import { DebriefScreen } from './components/DebriefScreen'
import { ProofScreen } from './components/ProofScreen'

type Screen = 'title' | 'chapter' | 'setup' | 'run' | 'debrief' | 'proof'

export default function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [preset, setPreset] = useState<Preset | null>(null)
  const [result, setResult] = useState<RunResult | null>(null)
  const [runKey, setRunKey] = useState(0)
  const [proofReturn, setProofReturn] = useState<Screen>('title')

  const openProof = (from: Screen) => {
    setProofReturn(from)
    setScreen('proof')
  }

  return (
    <div className="shell">
      {screen === 'title' && (
        <TitleScreen
          onChapter={() => setScreen('chapter')}
          onSkip={() => setScreen('setup')}
          onProof={() => openProof('title')}
        />
      )}
      {screen === 'chapter' && <Chapter1 onDone={() => setScreen('setup')} />}
      {screen === 'setup' && (
        <SetupScreen
          onStart={(p) => {
            setPreset(p)
            setRunKey((k) => k + 1)
            setScreen('run')
          }}
        />
      )}
      {screen === 'run' && preset && (
        <RunScreen
          key={runKey}
          alloc={preset.alloc}
          onDone={(r) => {
            setResult(r)
            setScreen('debrief')
          }}
        />
      )}
      {screen === 'debrief' && result && (
        <DebriefScreen
          result={result}
          onReplay={() => setScreen('setup')}
          onProof={() => openProof('debrief')}
        />
      )}
      {screen === 'proof' && (
        <ProofScreen onBack={() => setScreen(proofReturn === 'debrief' ? 'debrief' : 'setup')} />
      )}
    </div>
  )
}
