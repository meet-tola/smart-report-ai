"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Globe,
  X,
  FileSpreadsheet,
  SendHorizonal,
  SendHorizontal,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
// Import Framer Motion components
import { motion, AnimatePresence } from "framer-motion";

interface TemplateGalleryProps {
  onTemplateSelect: (templateId: string) => void;
  onUpload: (fileName: string, fileType: string, fileData: string) => void;
}

// ... (templates array remains the same, omitted for brevity)
const templates = [
    {
      id: "resume",
      name: "Professional Resume",
      description: "Modern resume template with clean layout",
      icon: FileText,
      thumbnail: "/modern-resume-template.png",
    },
    // ... rest of your templates
    {
      id: "form",
      name: "Application Form",
      description: "Multi-purpose application form",
      icon: FileSpreadsheet,
      thumbnail: "/application-form.png",
    },
  ];

export default function TemplateGallery({
  onTemplateSelect,
  onUpload,
}: TemplateGalleryProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [sourceActive, setSourceActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fileName, setFileName] = useState<string>("");

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const outsideContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle clicking outside to collapse
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        outsideContainerRef.current &&
        !outsideContainerRef.current.contains(event.target as Node)
      ) {
        if (inputValue.trim() === "" && uploadedFiles.length === 0) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputValue, uploadedFiles]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    if (isExpanded) {
      target.style.height = `${target.scrollHeight}px`;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsExpanded(true)

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
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-1">
          Create Better Documents with AI
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Start with a template or upload your files. AI helps you rewrite,
          format, and design clean reports.
        </p>
      </div>

      {/* --- SMOOTH INTERACTIVE INPUT BAR (FRAMER MOTION) --- */}
      {/* Wrapper div for click-outside detection */}
      <div
        ref={outsideContainerRef}
        className="flex flex-col w-full mb-12 items-center relative z-20"
      >
        <motion.div
          layout
          initial={false} 
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "w-full max-w-2xl border bg-white overflow-hidden relative",
            // Reduced padding in expanded state (py-3 instead of p-4) to fix top gap issues
            isExpanded
              ? "rounded-2xl ring-1 ring-black/5 px-4 py-3 flex flex-col"
              : "rounded-full py-2 px-4 flex items-center h-14 cursor-text"
          )}
          onClick={() => {
            if (!isExpanded) {
              setIsExpanded(true);
              setTimeout(() => textareaRef.current?.focus(), 100);
            }
          }}
        >
          {/* AnimatePresence allows us to animate elements as they are removed from the DOM */}
          <AnimatePresence mode="popLayout">
            {/* COMPACT MODE: Left Icons */}
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                className="flex items-center gap-3 pr-3"
              >
                 <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFileDialogOpen(true); }}
                  className="text-muted-foreground hover:text-primary transition-colors p-1"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSourceActive(!sourceActive); }}
                  className={cn(
                    "transition-colors p-1",
                    sourceActive ? "text-blue-500" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <Globe className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INPUT AREA (Main LayoutId keeps this stable during transition) */}
          <motion.div layout className="flex-1 min-w-0 relative flex flex-col justify-center">
            {/* Uploaded files chips */}
            <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-wrap gap-2 mb-2"
              >
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="max-w-[100px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
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
                isExpanded ? "min-h-[60px] leading-relaxed py-1" : "h-6 py-1 truncate"
              )}
              rows={1}
            />
          </motion.div>

          <AnimatePresence mode="popLayout">
            {/* COMPACT MODE: Right Upload Button */}
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
                className="pl-3"
              >
                 <button
                 type="button"
                 className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {/* EXPANDED MODE: Bottom Toolbar */}
            {isExpanded && (
              <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 10, transition: { duration: 0.1 } }}
                 transition={{ delay: 0.1 }} // Slight delay for toolbar appearance
                 className="flex items-center justify-between w-full pt-3 mt-2 border-t border-dashed"
              >
                 {/* Left side toolbar buttons */}
                 <div className="flex items-center gap-2">
                    <button
                       type="button"
                       onClick={() => setFileDialogOpen(true)}
                       className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/30 hover:bg-muted rounded-md transition-colors"
                    >
                       <FileText className="w-4 h-4" />
                       <span>Add File</span>
                    </button>
                    <button
                       type="button"
                       onClick={() => setSourceActive(!sourceActive)}
                       className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                          sourceActive
                             ? "bg-blue-50 text-blue-600"
                             : "text-muted-foreground bg-muted/30 hover:bg-muted"
                       )}
                    >
                       <Globe className="w-4 h-4" />
                       <span>Web Source</span>
                    </button>
                 </div>

                 {/* Right side generate button */}
                 <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  <span>Generate</span>
                  <ArrowUp className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {/* ------------------------------------------- */}

      {/* File Upload Dialog */}
      <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl mb-1">Upload Files</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Upload documents or images to include in your project
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <label
              htmlFor="file-upload-dialog"
              className="flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
            >
              <Upload className="w-6 h-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">
                Click to upload files
              </p>

              <input
                id="file-upload-dialog"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                multiple
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>

       {/* Original Upload Dialog (kept for other upload functionality) */}
       <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl mb-1">Upload Document</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Upload a Word document, PDF, or image to get started
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
            >
              <Upload className="w-6 h-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Click to upload</p>

              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>


      {/* Template Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Template Library</h2>
        <div className="flex justify-end">
          <Button
            variant="link"
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload your template
          </Button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-4 gap-3">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template.id)}
            className="group cursor-pointer border rounded-lg overflow-hidden bg-white hover:bg-accent/30 transition p-0"
            style={{ height: "150px" }}
          >
            {/* Thumbnail */}
            <div className="w-full h-[90px] bg-muted relative overflow-hidden">
              <Image
                src={template.thumbnail || "/placeholder.svg"}
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Text */}
            <div className="px-2 py-2">
              <h3 className="text-xs font-medium truncate">{template.name}</h3>
              <p className="text-[10px] text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}