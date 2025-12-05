"use client"

import { ArrowLeft, Save, Download, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import DocumentCanvas from "@/components/document-canvas"
import ExtractedFieldsPanel from "@/components/extracted-fields-panel"
import { useState } from "react"
import type { DocumentField } from "@/app/page"

interface EditorProps {
  uploadedFile: File | null
}

export default function Editor({ uploadedFile }: EditorProps) {
  const [fields, setFields] = useState<DocumentField[]>([])

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Editor Toolbar */}
      <div className="h-14 bg-card border-b border-border px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-sm font-semibold">{uploadedFile?.name || "Untitled Document"}</h2>
            <p className="text-xs text-muted-foreground">Last saved 2 minutes ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Wand2 className="w-4 h-4" />
            Extract Info
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg min-h-[800px] p-12">
            <DocumentCanvas
              fileType={uploadedFile?.type || ""}
              fileData=""
            />
          </div>
        </div>

        {/* Right Sidebar - Fields */}
        <aside className="w-80 border-l border-border bg-card overflow-y-auto">
          <ExtractedFieldsPanel fields={fields} onFieldsUpdate={setFields} />
        </aside>
      </div>
    </div>
  )
}
