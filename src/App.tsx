import { useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { PathScreen } from './components/PathScreen'
import { QuickScreen } from './components/QuickScreen'
import { Chapter1 } from './components/Chapter1'
import { SetupScreen, Preset } from './components/SetupScreen'
import { RunScreen, RunResult } from './components/RunScreen'
import { DebriefScreen } from './components/DebriefScreen'
import { ProofScreen } from './components/ProofScreen'

type Screen = 'home' | 'path' | 'quick' | 'chapter' | 'setup' | 'run' | 'debrief' | 'proof'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [preset, setPreset] = useState<Preset | null>(null)
  const [result, setResult] = useState<RunResult | null>(null)
  const [runKey, setRunKey] = useState(0)
  const [proofReturn, setProofReturn] = useState<Screen>('home')
  const [chapterNext, setChapterNext] = useState<'setup' | 'proof'>('setup')

  const openProof = (from: Screen) => {
    setProofReturn(from)
    setScreen('proof')
  }

  return (
    <div className="shell">
      {screen === 'home' && (
        <HomeScreen onStart={() => setScreen('path')} onProof={() => openProof('home')} />
      )}
      {screen === 'path' && (
        <PathScreen
          onLongTerm={() => setScreen('setup')}
          onLearn={() => {
            setChapterNext('proof')
            setScreen('chapter')
          }}
          onQuick={() => setScreen('quick')}
          onHome={() => setScreen('home')}
        />
      )}
      {screen === 'quick' && (
        <QuickScreen onProof={() => openProof('quick')} onBack={() => setScreen('path')} />
      )}
      {screen === 'chapter' && (
        <Chapter1
          onDone={() => (chapterNext === 'proof' ? openProof('chapter') : setScreen('setup'))}
          doneLabel={chapterNext === 'proof' ? 'Now show me the proof' : undefined}
        />
      )}
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
