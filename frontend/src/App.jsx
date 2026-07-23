import { useState } from 'react'
import './App.css'

function App() {
  const [question, setQuestion] = useState('')
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleAsk() {
    if (!question.trim()) return
    setLoading(true)
    setSteps([])

    const response = await fetch('http://127.0.0.1:5000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })

    const data = await response.json()
    setSteps(data)
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAsk()
  }

  return (
    <div className="app">
      <h1>Research Agent</h1>
      <p className="subtitle">An agentic AI that plans, searches, calculates, and reasons step by step.</p>

      <div className="input-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
        />
        <button onClick={handleAsk} disabled={loading}>
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </div>

      <div className="trace">
        {steps.map((step, i) => (
          <div key={i} className={`step ${step.type}`}>
            {step.type === 'tool_call' ? (
              <>
                <span className="tool-name">{step.tool}</span><br />
                <strong>Input:</strong> {JSON.stringify(step.args)}
                <div className="result">{step.result}</div>
              </>
            ) : (
              <>
                <span className="label">FINAL ANSWER</span>
                <div>{step.text}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App