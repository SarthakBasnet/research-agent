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

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion }),
      })

      const steps = await response.json()
      const finalStep = steps.find((s) => s.type === "final_answer")

      setConversation((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answer: finalStep ? finalStep.text : "Something went wrong.",
          steps,
        },
      ])
    } catch (err) {
      setConversation((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answer: "Error: could not reach the server. Is the backend running?",
          steps: [],
        },
      ])
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
        {loading && (
          <div className="self-start bg-gray-800 text-gray-400 rounded-2xl rounded-bl-sm px-4 py-3 text-sm animate-pulse">
            Thinking...
          </div>
        )}
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