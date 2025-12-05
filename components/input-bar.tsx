/* eslint-disable jsx-a11y/alt-text */
"use client"
import type React from "react"
import { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, Globe, X, ArrowUp, File, BookOpen, Image } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { useClickOutside } from "@/hooks/use-click-outside" 

export function InputBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [sourceActive, setSourceActive] = useState(false)
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const [docType, setDocType] = useState("report") 
  const [isGenerating, setIsGenerating] = useState(false)
  const [includeImages, setIncludeImages] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Use the custom hook for click outside detection
  useClickOutside(containerRef, (event: Event) => {
    // Don't collapse if clicking on file input
    if ((event.target as HTMLElement).tagName === 'INPUT' && 
        (event.target as HTMLInputElement).type === 'file') {
      return
    }
    
    if (inputValue.trim() === "" && uploadedFiles.length === 0) {
      setIsExpanded(false)
    }
  })

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    const target = e.target
    target.style.height = "auto"
    if (isExpanded) {
      target.style.height = `${target.scrollHeight}px`
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle file upload (you'll need to implement the actual upload logic, e.g., via FormData to API)
  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)])
    }
    setFileDialogOpen(false)
  }

  // Placeholder for generate handler - call your API here
  const handleGenerate = async () => {
    setIsGenerating(true)
    const formData = new FormData()
    formData.append("description", inputValue)
    formData.append("docType", docType)
    formData.append("includeImages", includeImages.toString())
    uploadedFiles.forEach((file) => formData.append("files", file))

    if (sourceActive) {
      formData.append("webSources", "enabled")
    }

    try {
      const response = await fetch("/api/document/ai/generate", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("Creation failed")
      const data = await response.json()
      // Redirect to edit - generation starts there
      window.location.href = `/document/${data.documentId}`
    } catch (error) {
      console.error("Creation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col w-full mb-8 sm:mb-12 items-center relative z-20">
      <motion.div
        layout
        initial={false}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl border bg-white overflow-hidden relative",
          isExpanded
            ? "rounded-2xl ring-1 ring-black/5 px-3 sm:px-4 py-2 sm:py-3 flex flex-col"
            : "rounded-full py-1.5 sm:py-2 px-3 sm:px-4 flex items-center h-12 sm:h-14 cursor-text",
        )}
        onClick={() => {
          if (!isExpanded) {
            setIsExpanded(true)
            setTimeout(() => textareaRef.current?.focus(), 50)
          }
        }}
        draggable={false}
      >
        {/* AnimatePresence allows us to animate elements as they are removed from the DOM */}
        <AnimatePresence mode="popLayout">
          {/* COMPACT MODE: Left Icons */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.15 },
              }}
              className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-3"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFileDialogOpen(true)
                }}
                className="text-muted-foreground hover:text-primary transition-colors p-1"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSourceActive(!sourceActive)
                }}
                className={cn(
                  "transition-colors p-1",
                  sourceActive ? "text-blue-500" : "text-muted-foreground hover:text-primary",
                )}
              >
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {/* New compact icon for doc type */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  // Toggle or open selector; for compact, perhaps just a hint
                }}
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                title="Document Type"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="flex-1 min-w-0 relative flex flex-col justify-center">
          {/* Uploaded files chips */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2"
              >
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="max-w-[60px] sm:max-w-[100px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile(index)
                      }}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            placeholder="Describe your project..."
            className={cn(
              "w-full bg-transparent outline-none resize-none text-sm placeholder:text-muted-foreground/70",
              isExpanded ? "min-h-[50px] sm:min-h-[60px] leading-relaxed py-1" : "h-6 py-1 truncate",
            )}
            rows={1}
          />
        </motion.div>

        <AnimatePresence mode="popLayout">
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.15 },
              }}
              className="pl-2 sm:pl-3"
            >
              <button
                type="button"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.1 } }}
              transition={{ delay: 0.1 }} // Slight delay for toolbar appearance
              className="flex items-center justify-between w-full pt-2 sm:pt-3 mt-1 sm:mt-2 border-t border-dashed"
            >
              {/* Left side toolbar buttons - Upgraded with more options */}
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {/* New: Document Type Selector */}
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger size="sm" className="flex items-center text-xs border-0 shadow-none font-medium text-muted-foreground bg-muted/30 hover:bg-muted rounded-md transition-colors w-[120px] sm:w-[140px]">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="proposal">Project Proposal</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => setFileDialogOpen(true)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/30 hover:bg-muted rounded-md transition-colors"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Add File</span>
                  <span className="sm:hidden">File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceActive(!sourceActive)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    sourceActive ? "bg-blue-50 text-blue-600" : "text-muted-foreground bg-muted/30 hover:bg-muted",
                  )}
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Web Source</span>
                  <span className="sm:hidden">Web</span>
                </button>
                
                {/* New: Include Images Toggle */}
                <button
                  type="button"
                  onClick={() => setIncludeImages(!includeImages)}
                  className={cn(
                    " items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors hidden",
                    includeImages ? "bg-green-50 text-green-600" : "text-muted-foreground bg-muted/30 hover:bg-muted",
                  )}
                >
                  <Image className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Images</span>
                  <span className="sm:hidden">Img</span>
                </button>
              </div>

              {/* Right side generate button */}
              <Button size="sm" className="rounded-full" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden file input for uploads */}
        <input
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          onClick={(e) => e.stopPropagation()}
          className="hidden"
          ref={(el) => {
            if (fileDialogOpen && el) {
              el.click()
            }
          }}
        />
      </motion.div>
    </div>
  )
}