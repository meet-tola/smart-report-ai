"use client"

import { useEffect, useState } from "react"

interface AILoadingSkeletonProps {
  messages?: string[]
}

const defaultMessages = ["AI is analyzing...", "Processing insights...", "Generating results...", "Almost there..."]

const lineConfigs = [
  { baseWidths: ["w-full", "w-10/12", "w-11/12"] },
  { baseWidths: ["w-11/12", "w-9/12", "w-full"] },
  { baseWidths: ["w-10/12", "w-full", "w-9/12"] },
  { baseWidths: ["w-full", "w-11/12", "w-10/12"] },
  { baseWidths: ["w-9/12", "w-11/12", "w-full"] },
]

export function AILoadingSkeleton({ messages = defaultMessages }: AILoadingSkeletonProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [visibleLines, setVisibleLines] = useState(0)
  const [widthCycle, setWidthCycle] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [messages.length])

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => (prev >= 5 ? 0 : prev + 1))
    }, 800)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setWidthCycle((prev) => (prev + 1) % 3)
    }, 1200)
    return () => clearInterval(timer)
  }, [])

  const getLineWidth = (lineIndex: number) => {
    return lineConfigs[lineIndex].baseWidths[widthCycle]
  }

  return (
    <div className="flex flex-col items-center justify-center gap-16">
      <div className="flex flex-col gap-3 w-full max-w-md">
        <div className="space-y-4 p-6">
          {[0, 1, 2, 3, 4].map(
            (lineIndex) =>
              visibleLines > lineIndex && (
                <div
                  key={lineIndex}
                  className={`h-4 bg-linear-to-r from-muted via-muted-foreground/30 to-muted rounded-full animate-pulse transition-all duration-300 ${getLineWidth(lineIndex)}`}
                />
              ),
          )}
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground h-8 flex items-center justify-center min-w-60">
          <span key={messageIndex} className="animate-fade-in">
            {messages[messageIndex]}
          </span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">
            This may take a moment.
          </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}