/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  LayoutTemplate,
  Loader2,
  MoreVertical,
  Star,
  Download,
  Share2,
  Link2,
  Trash2,
  ChevronDown,
  SortDesc,
  List,
  Grid,
  Folder,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TemplateGallery } from "@/components/template-gallery";
import { InputBar } from "@/components/input-bar";
import { getFileTypeColor, getFriendlyFileType } from "@/lib/document-utils";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  isFavorite?: boolean;
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

  // New states for filters and view
  const [filterType, setFilterType] = useState<
    "All" | "Documents" | "Presentations" | "Projects"
  >("All");
  const [sortBy, setSortBy] = useState<"Latest" | "Oldest" | "A-Z" | "Z-A">(
    "Latest"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
            type: doc.fileType || "text/html",
            updatedAt: doc.updatedAt,
            content: "",
            thumbnail: doc.thumbnail || undefined,
            isFavorite: false, // Default, can be fetched from DB
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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  const toggleFavorite = (docId: string) => {
    setRecentDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, isFavorite: !doc.isFavorite } : doc
      )
    );
  };

  const handleThreeDotClick = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    // Handle dropdown actions here, e.g., download, share, etc.
    console.log(`Action for doc ${docId}`);
  };

  const isActive = (tab: "documents" | "upload" | "templates") =>
    activeTab === tab;
  const isDocumentsDisabled = recentDocuments.length === 0;

  // Filter and sort recentDocuments
  const filteredAndSortedDocuments = recentDocuments
    .filter((doc) => {
      // Simple filter based on type; extend as needed
      if (filterType === "All") return true;
      if (filterType === "Documents")
        return doc.type.startsWith("text/") || doc.type === "application/pdf";
      if (filterType === "Presentations")
        return (
          doc.type.includes("presentation") || doc.type.includes("powerpoint")
        );
      if (filterType === "Projects") return doc.type.includes("project");
      return true;
    })
    .sort((a, b) => {
      const aDate = new Date(a.updatedAt).getTime();
      const bDate = new Date(b.updatedAt).getTime();
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      switch (sortBy) {
        case "Latest":
          return bDate - aDate;
        case "Oldest":
          return aDate - bDate;
        case "A-Z":
          return aTitle.localeCompare(bTitle);
        case "Z-A":
          return bTitle.localeCompare(aTitle);
        default:
          return 0;
      }
    });

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

  // List View Item
  const ListViewItem = ({ doc }: { doc: RecentDocument }) => (
    <div
      onClick={() => handleDocumentClick(doc.id)}
      className="group flex items-center space-x-4 p-4 hover:bg-muted/50 rounded-lg transition-colors w-full text-left cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleDocumentClick(doc.id);
        }
      }}
    >
      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
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
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {doc.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">
            {getFriendlyFileType(doc.type)}
          </p>
          <span className="text-muted-foreground">•</span>
          <p className="text-xs text-muted-foreground/70">
            Last edited {formatRelativeTime(doc.updatedAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(doc.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Star
                className={`w-4 h-4 ${
                  doc.isFavorite
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Favorite</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => handleThreeDotClick(e, doc.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => handleThreeDotClick(e, doc.id)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => handleThreeDotClick(e, doc.id)}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => handleThreeDotClick(e, doc.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Move to trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>More actions</TooltipContent>
        </Tooltip>
      </div>
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
            Recents
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Recent</h2>
                <div className="flex items-center space-x-2">
                  {/* Filter Dropdown */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center space-x-1 h-9 px-3"
                          >
                            <FileText className="w-4 h-4" />
                            <span>{filterType}</span>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setFilterType("All")}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            All
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterType("Documents")}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Documents
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterType("Presentations")}
                          >
                            <FileImage className="w-4 h-4 mr-2" />
                            Presentations
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterType("Projects")}
                          >
                            <Folder className="w-4 h-4 mr-2" />
                            Projects
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent>Filter documents</TooltipContent>
                  </Tooltip>

                  {/* Sort Dropdown */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0">
                            <SortDesc className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSortBy("Latest")}>
                            Latest
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy("Oldest")}>
                            Oldest
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy("A-Z")}>
                            A to Z
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy("Z-A")}>
                            Z to A
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent>Sort documents</TooltipContent>
                  </Tooltip>

                  {/* View Toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-9 w-9 p-0"
                        onClick={() =>
                          setViewMode(viewMode === "grid" ? "list" : "grid")
                        }
                      >
                        {viewMode === "grid" ? (
                          <List className="w-4 h-4" />
                        ) : (
                          <Grid className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle view</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {isLoadingDocuments ? (
                <DocumentSkeleton />
              ) : filteredAndSortedDocuments.length > 0 ? (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredAndSortedDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleDocumentClick(doc.id)}
                          className="group relative cursor-pointer text-left"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleDocumentClick(doc.id);
                            }
                          }}
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
                            {/* Hover actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(doc.id);
                                    }}
                                    className="h-8 w-8 p-0 bg-black/20 hover:bg-black/30 rounded-full"
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        doc.isFavorite
                                          ? "text-yellow-500 fill-yellow-500"
                                          : "text-white"
                                      }`}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  Favorite
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-8 w-8 p-0 bg-black/20 hover:bg-black/30 rounded-full"
                                      >
                                        <MoreVertical className="w-4 h-4 text-white" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      <DropdownMenuItem
                                        onClick={(e) =>
                                          handleThreeDotClick(e, doc.id)
                                        }
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) =>
                                          handleThreeDotClick(e, doc.id)
                                        }
                                      >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) =>
                                          handleThreeDotClick(e, doc.id)
                                        }
                                      >
                                        <Link2 className="w-4 h-4 mr-2" />
                                        Copy link
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={(e) =>
                                          handleThreeDotClick(e, doc.id)
                                        }
                                        className="text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Move to trash
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  More actions
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {doc.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {getFriendlyFileType(doc.type)}
                            </p>
                            <span className="text-muted-foreground">•</span>
                            <p className="text-xs text-muted-foreground/70">
                              Last edited {formatRelativeTime(doc.updatedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAndSortedDocuments.map((doc) => (
                        <ListViewItem key={doc.id} doc={doc} />
                      ))}
                    </div>
                  )}
                </>
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
