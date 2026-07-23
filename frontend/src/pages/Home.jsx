import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ChatMessage from "@/components/ChatMessage"

function Home() {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState([])

  async function handleAsk() {
    if (loading) return
    if (!question.trim()) return

    const currentQuestion = question
    setQuestion("")
    setLoading(true)

    const liveSteps = []
    let liveAnswer = "Thinking..."

    setConversation((prev) => [
      ...prev,
      { question: currentQuestion, answer: liveAnswer, steps: liveSteps, live: true },
    ])

    function updateLiveTurn() {
      setConversation((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          question: currentQuestion,
          answer: liveAnswer,
          steps: [...liveSteps],
          live: true,
        }
        return updated
      })
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.trim()) continue
          const step = JSON.parse(line)

          if (step.type === "tool_call") {
            liveSteps.push(step)
            liveAnswer = `Using ${step.tool}...`
          } else if (step.type === "final_answer") {
            liveAnswer = step.text
          }

          updateLiveTurn()
        }
      }
    } catch (err) {
      liveAnswer = "Error: could not reach the server. Is the backend running?"
      updateLiveTurn()
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleAsk()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-lg font-semibold">Research Agent</h1>
        <p className="text-sm text-gray-400">
          An agentic AI that plans, searches, calculates, and reasons step by step.
        </p>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 flex flex-col gap-6 overflow-y-auto">
        {conversation.map((turn, i) => (
          <ChatMessage key={i} {...turn} />
        ))}
      </main>

      <footer className="border-t border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something..."
            disabled={loading}
            className="bg-gray-900 border-gray-700 text-white"
          />
          <Button onClick={handleAsk} disabled={loading}>
            Ask
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default Home