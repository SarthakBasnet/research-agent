import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  // Uses Render in production and localhost during development
  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  async function handleAsk() {
    if (!question.trim()) return;

    setLoading(true);
    setSteps([]);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      setSteps(data);
    } catch (error) {
      console.error(error);

      setSteps([
        {
          type: "final_answer",
          text: `❌ Error: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleAsk();
    }
  }

  return (
    <div className="container">
      <h1>Research Agent</h1>
      <p>
        An agentic AI that plans, searches, calculates, and reasons step by
        step.
      </p>

      <div className="input-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
        />

        <button onClick={handleAsk} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      <div className="trace">
        {steps.map((step, i) => (
          <div key={i} className={`step ${step.type}`}>
            {step.type === "tool_call" ? (
              <>
                <span className="tool-name">{step.tool}</span>
                <br />
                <strong>Input:</strong>{" "}
                {JSON.stringify(step.args, null, 2)}
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
  );
}

export default App;