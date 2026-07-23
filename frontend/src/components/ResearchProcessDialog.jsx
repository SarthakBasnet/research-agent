import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

function ResearchProcessDialog({ open, onOpenChange, steps }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Research Process</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="flex flex-col gap-3">
            {steps
              .filter((s) => s.type === "tool_call")
              .map((step, i) => (
                <div
                  key={i}
                  className="border-l-2 border-amber-500 bg-amber-500/10 rounded-md p-3 text-sm"
                >
                  <span className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded mb-2">
                    {step.tool}
                  </span>
                  <div className="text-gray-300">
                    <strong>Input:</strong> {JSON.stringify(step.args)}
                  </div>
                  <div className="mt-1 text-gray-400 font-mono text-xs whitespace-pre-wrap break-words">
                    {step.result}
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ResearchProcessDialog