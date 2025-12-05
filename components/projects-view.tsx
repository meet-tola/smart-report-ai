"use client"

import { ArrowLeft, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface ProjectsViewProps {
  onOpenEditor: () => void
  onBack: () => void
  selectedTemplate: string | null
  uploadedFile: File | null
}

const recentProjects = [
  {
    id: "1",
    name: "Student Registration Form",
    lastModified: new Date(Date.now() - 1000 * 60 * 30),
    thumbnail: "/student-form.jpg",
  },
  {
    id: "2",
    name: "Academic Transcript",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
    thumbnail: "/transcript.png",
  },
  {
    id: "3",
    name: "Course Certificate",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 5),
    thumbnail: "/formal-certificate.png",
  },
  {
    id: "4",
    name: "School Application",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
    thumbnail: "/abstract-application.png",
  },
]

export default function ProjectsView({ onOpenEditor, onBack, selectedTemplate, uploadedFile }: ProjectsViewProps) {
  return (
    <div className="p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Recent Projects</h1>
          <p className="text-muted-foreground">
            {selectedTemplate
              ? "Continue editing or start a new project"
              : uploadedFile
                ? `Working with: ${uploadedFile.name}`
                : "Your recent documents"}
          </p>
        </div>
      </div>

      {/* New Project Card */}
      <Card
        className="p-8 mb-8 cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-primary/30 hover:border-primary"
        onClick={onOpenEditor}
      >
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-xl bg-primary/10">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-1">Start New Project</h3>
            <p className="text-sm text-muted-foreground">
              {selectedTemplate ? "Open the template in editor" : "Edit your uploaded document"}
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Projects Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Continue Working</h2>
        <div className="grid grid-cols-4 gap-6">
          {recentProjects.map((project) => (
            <Card
              key={project.id}
              className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={onOpenEditor}
            >
              <div className="aspect-4/3 bg-muted relative overflow-hidden">
                <Image
                  src={project.thumbnail || "/placeholder.svg"}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  width={300}
                    height={225}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 truncate">{project.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(project.lastModified, { addSuffix: true })}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
