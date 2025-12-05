/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import ProjectsView from "@/components/projects-view"
import { useRouter } from "next/navigation"

export default function ProjectsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const router = useRouter()

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6">
      <ProjectsView
        onOpenEditor={() => {
          // Navigation handled within ProjectsView or pass to router
        }}
        onBack={() => router.push("/")}
        selectedTemplate={selectedTemplate}
        uploadedFile={uploadedFile}
      />
    </div>
  )
}
