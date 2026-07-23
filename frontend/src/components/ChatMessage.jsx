import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import ResearchProcessDialog from "./ResearchProcessDialog"

function ChatMessage({ question, answer, steps }) {
  const [open, setOpen] = useState(false)
  const toolCallCount = steps.filter((s) => s.type === "tool_call").length

  return (
    <div className="flex flex-col gap-3">
      <div className="self-end bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
        {question}
      </div>

      <div className="self-start flex flex-col items-start gap-2 max-w-[80%]">
        <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        </div>

        {toolCallCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white hover:bg-gray-800 px-2 whitespace-nowrap"
            onClick={() => setOpen(true)}
          >
            View Research Process ({toolCallCount} step{toolCallCount > 1 ? "s" : ""})
          </Button>
        )}
      </div>

      <ResearchProcessDialog open={open} onOpenChange={setOpen} steps={steps} />
    </div>
  )
}

export default ChatMessage