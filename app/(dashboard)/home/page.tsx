/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, LayoutTemplate, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateGallery } from "@/components/template-gallery";
import { InputBar } from "@/components/input-bar";
import {
  getFileTypeColor,
  getFriendlyFileType,
} from "@/lib/document-utils";
import Image from "next/image";

interface Document {
  id: string;
  title: string;
  fileType?: string; 
  createdAt: string;
  updatedAt: string;
  content: string;
  thumbnail?: string; 
}

interface RecentDocument {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
  content: string;
  thumbnail?: string; 
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "documents" | "upload" | "templates"
  >("documents");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);

  // Fetch documents
  useEffect(() => {
    const fetchAndProcessDocuments = async () => {
      try {
        const res = await fetch("/api/document");
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();

        const documentsList: Document[] = data.documents || [];
        setDocuments(documentsList);

        // Process documents - NO client-side thumbnail gen; use DB field
        const processedRecentDocs = documentsList.map((doc: Document) => {
          const recentDoc: RecentDocument = {
            id: doc.id,
            title: doc.title,
            type: doc.fileType || 'text/html', 
            updatedAt: doc.updatedAt,
            content: "",
            thumbnail: doc.thumbnail || undefined, 
          };
          return recentDoc;
        });

        setRecentDocuments(processedRecentDocs);

        // NEW: End loading state here
        setIsLoadingDocuments(false);

        // Set default active tab based on documents
        if (processedRecentDocs.length === 0) {
          setActiveTab("templates");
        } else {
          setActiveTab("documents");
        }
      } catch (err) {
        console.error("❌ documents fetch error:", err);
        setIsLoadingDocuments(false);
      }
    };

    fetchAndProcessDocuments();
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);

      const res = await fetch("/api/document/create", {
        method: "POST",
        body: formData, // <= IMPORTANT
      });

      const result = await res.json();
      console.log("Upload result:", result);
      router.push(`/document/${result.document.id}`);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      setUploadDialogOpen(false);
    }
  };

  const handleDocumentClick = (documentId: string) => {
    router.push(`/document/${documentId}`);
  };

  const handleTemplateClick = (templateId: string) => {
    router.push(`/templates/${templateId}`);
  };

  const isActive = (tab: "documents" | "upload" | "templates") =>
    activeTab === tab;
  const isDocumentsDisabled = recentDocuments.length === 0;

  // Skeleton component for document cards
  const DocumentSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="h-40 w-full rounded-lg bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-h-screen relative w-full bg-white overflow-hidden">
        {/* --- BACKGROUND LAYERS START --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Your grid */}
          <div
            className="absolute inset-0 h-[50vh] w-full"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 20%, transparent 90%)",
              maskImage:
                "linear-gradient(to bottom, black 20%, transparent 90%)",
            }}
          ></div>
        </div>
        {/* Header */}
        <div className="relative z-10 px-6 pt-12 md:pt-16 max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Create Better Documents with AI
          </h1>

          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Start with a template or upload your files. AI helps you rewrite,
            format, and design clean reports.
          </p>
        </div>
        {/* Tab Buttons */}
        <div className="flex gap-2 sm:gap-3 justify-center my-4 sm:my-6 px-4">
          <Button
            variant="outline"
            className={`
              min-w-[110px] sm:min-w-[140px] rounded-full transition-colors
              ${
                isActive("documents")
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }
              ${isDocumentsDisabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => setActiveTab("documents")}
            disabled={isDocumentsDisabled}
          >
            Your Documents
          </Button>
          <Button
            variant="outline"
            className={`
              min-w-[90px] sm:min-w-[140px] rounded-full transition-colors
              ${
                isActive("upload")
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
            onClick={() => {
              setActiveTab("upload");
              setUploadDialogOpen(true);
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button
            variant="outline"
            className={`
              min-w-[90px] sm:min-w-[140px] rounded-full transition-colors
              ${
                isActive("templates")
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
            onClick={() => setActiveTab("templates")}
          >
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Templates
          </Button>
        </div>
        {/* Input Bar Component */}
        <InputBar />
        {/* Content Section */}
        <div className="px-6 pb-12 max-w-6xl mx-auto">
          {/* Recent Documents Tab */}
          {activeTab === "documents" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-semibold mb-6">
                Your Recent Documents
              </h2>
              {isLoadingDocuments ? (
                <DocumentSkeleton />
              ) : recentDocuments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {recentDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc.id)}
                      className="group cursor-pointer text-left"
                    >
                      <div className="relative mb-3 rounded-lg overflow-hidden bg-muted border group-hover:border-primary/50 transition-colors h-40">
                        {doc.thumbnail ? (
                          <Image
                            src={doc.thumbnail}
                            alt={doc.title}
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex flex-col items-center justify-center ${getFileTypeColor(
                              doc.type
                            )}`}
                          >

                            <span className="text-xs font-medium capitalize">
                              {doc.type.split("/").pop() || doc.type}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getFriendlyFileType(doc.type)}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Last edited {formatRelativeTime(doc.updatedAt)}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No documents yet
                  </h3>
                  <p className="text-sm text-muted-foreground/70 mb-4">
                    Upload your first document to get started
                  </p>
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <TemplateGallery onTemplateClick={handleTemplateClick} />
          )}
        </div>
        {/* Upload Dialog */}{" "}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          {" "}
          <DialogContent className="sm:max-w-md">
            {" "}
            <DialogHeader>
              {" "}
              <DialogTitle>Upload Your Document</DialogTitle>{" "}
            </DialogHeader>{" "}
            {isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-4 h-40">
                {" "}
                <Loader2 className="w-8 h-8 animate-spin text-primary" />{" "}
                <p className="text-sm text-muted-foreground">
                  {" "}
                  Uploading your document...{" "}
                </p>{" "}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg hover:border-primary/50 cursor-pointer transition-colors group">
                {" "}
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {" "}
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />{" "}
                  <p className="text-sm text-muted-foreground">
                    {" "}
                    Click to upload or drag and drop{" "}
                  </p>{" "}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {" "}
                    PDF, DOCX, DOC, PNG, JPG{" "}
                  </p>{" "}
                </div>{" "}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                />{" "}
              </label>
            )}{" "}
          </DialogContent>{" "}
        </Dialog>{" "}
      </div>{" "}
    </div>
  );
}