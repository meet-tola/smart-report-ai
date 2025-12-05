"use client"

import Image from "next/image"

interface Template {
  id: string
  name: string
  category: string
  thumbnail: string
}

interface TemplateGalleryProps {
  onTemplateClick: (templateId: string) => void
}

const templates: Template[] = [
  {
    id: "resume",
    name: "Professional Resume",
    category: "Documents",
    thumbnail: "/professional-resume.png",
  },
  {
    id: "cover-letter",
    name: "Cover Letter",
    category: "Documents",
    thumbnail: "/cover-letter.jpg",
  },
  {
    id: "report",
    name: "Business Report",
    category: "Documents",
    thumbnail: "/business-report.jpg",
  },
  {
    id: "invoice",
    name: "Invoice",
    category: "Documents",
    thumbnail: "/business-invoice.png",
  },
  {
    id: "presentation",
    name: "Presentation",
    category: "Presentations",
    thumbnail: "/dynamic-presentation.png",
  },
  {
    id: "proposal",
    name: "Proposal",
    category: "Presentations",
    thumbnail: "/proposal.jpg",
  },
]

export function TemplateGallery({ onTemplateClick }: TemplateGalleryProps) {
  const groupedTemplates = {
    Documents: templates.filter((t) => t.category === "Documents"),
    Presentations: templates.filter((t) => t.category === "Presentations"),
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{category}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onTemplateClick(template.id)}
                className="group cursor-pointer text-left"
              >
                <div className="relative mb-3 rounded-lg overflow-hidden bg-muted border group-hover:border-primary/50 transition-colors h-40">
                  <Image
                    src={template.thumbnail || "/placeholder.svg"}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{category}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
