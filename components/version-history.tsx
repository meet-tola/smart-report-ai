"use client"

import type { DocumentVersion } from "@/app/page"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface VersionHistoryProps {
  versions: DocumentVersion[]
  onRestore: (version: DocumentVersion) => void
}

export default function VersionHistory({ versions, onRestore }: VersionHistoryProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Version History</h2>

      {versions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No versions saved yet.</p>
      ) : (
        <div className="space-y-2">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border hover:bg-muted/50 transition"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {index === 0 ? "Current" : `${index} change${index > 1 ? "s" : ""} ago`}
                </p>
                <p className="text-xs text-muted-foreground">{formatTime(version.timestamp)}</p>
              </div>
              {index > 0 && (
                <Button size="sm" variant="ghost" onClick={() => onRestore(version)} className="h-8 w-8 p-0">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
