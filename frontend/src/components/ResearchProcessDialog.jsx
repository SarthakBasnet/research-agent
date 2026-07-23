import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

function ResearchProcessDialog({ open, onOpenChange, steps }) {
  const toolCalls = steps.filter((s) => s.type === "tool_call")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Research Process</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="flex flex-col gap-3 w-full min-w-0">
            {toolCalls.map((step, i) => (
              <div key={i} className="border-l-2 border-amber-500 bg-amber-500/10 rounded-md p-3 text-sm w-full min-w-0">
                {step.tool === "web_search" && (
                  <div className="w-full min-w-0">
                    <div className="text-gray-300 mb-2">
                      Searched: <span className="italic">{step.args.query}</span>
                    </div>
                    <div className="flex flex-col gap-2 w-full min-w-0">
                      {Array.isArray(step.result) && step.result.map((source, j) => {
                        return (
                          <a key={j} href={source.url} target="_blank" rel="noopener noreferrer" className="block w-full min-w-0 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-md p-2 transition">
                            <div className="text-blue-400 text-sm font-medium break-words">{source.title}</div>
                            <div className="text-gray-500 text-xs break-all">{source.url}</div>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                {step.tool === "calculator" && (
                  <div className="w-full min-w-0">
                    <div className="text-gray-300">
                      Calculated: <span className="font-mono">{step.args.expression}</span>
                    </div>
                    <div className="text-gray-400 font-mono text-xs mt-1">= {step.result}</div>
                  </div>
                )}

                {step.tool === "fetch_page" && (
                  <div className="w-full min-w-0">
                    <div className="text-gray-300 mb-1">Read page:</div>
                    <a href={step.args.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm break-all">
                      {step.args.url}
                    </a>
                  </div>
                )}

                {step.tool !== "web_search" && step.tool !== "calculator" && step.tool !== "fetch_page" && (
                  <div className="text-gray-400 text-xs w-full min-w-0 break-words">{JSON.stringify(step)}</div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ResearchProcessDialog