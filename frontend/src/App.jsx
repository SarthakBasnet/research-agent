import { useState } from 'react'
import './App.css'

function App() {
  const [question, setQuestion] = useState('')
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleAsk() {
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

  return (
    <div className="app">
      <h1>Research Agent</h1>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>

      <div className="trace">
        {steps.map((step, i) => (
          <div key={i} className={`step ${step.type}`}>
            {step.type === 'tool_call' ? (
              <>
                <strong>Tool:</strong> {step.tool}<br />
                <strong>Input:</strong> {JSON.stringify(step.args)}<br />
                <strong>Result:</strong> {step.result}
              </>
            ) : (
              <>
                <strong>Final Answer:</strong><br />
                {step.text}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App