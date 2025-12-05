"use client"

import type React from "react"
import { useState } from "react"
import { Upload } from "lucide-react"

interface DocumentUploaderProps {
  onUpload: (fileName: string, fileType: string, fileData: string) => void
}

export default function DocumentUploader({ onUpload }: DocumentUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState<string>("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setFileName(file.name)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.fileData) {
        onUpload(data.fileName, data.fileType, data.fileData)
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Document</h2>

      <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
        <div className="flex flex-col items-center justify-center">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or images</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif"
          onChange={handleFileChange}
          disabled={loading}
        />
      </label>

      {loading && <div className="mt-4 text-center text-sm text-muted-foreground">Processing {fileName}...</div>}

      <div className="mt-6 text-xs text-muted-foreground space-y-2">
        <p className="font-semibold">Supported formats:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>PDF files</li>
          <li>Microsoft Word (.docx, .doc)</li>
          <li>Images (JPG, PNG, GIF)</li>
        </ul>
      </div>
    </div>
  )
}
