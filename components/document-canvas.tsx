/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { PanelRightOpen } from "lucide-react";
import { DocxToHtmlConverter } from "@omer-go/docx-parser-converter-ts";
import JSZip from "jszip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Editor } from "@tiptap/react";
import { SmartSidebar } from "./smart-sidebar";
import { TextEditor } from "./editor/text-editor";
import { EditorToolbar } from "./editor/toolbars/editor-toolbar";
import { UpdateDetailsModal } from "./editor/update-details-modal";
import { AILoadingSkeleton } from "@/components/ai-loading-skeleton";

interface DocumentCanvasProps {
  fileType: string;
  fileData: string;
  documentId: string;
  isPending?: boolean;
  status?: string;
}

export default function DocumentCanvas({
  fileType,
  fileData,
  documentId,
  status = "ready",
}: DocumentCanvasProps) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string>("");
  const [references, setReferences] = useState<
    Array<{ title: string; authors: string; year: string; url: string }>
  >([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanData, setScanData] = useState<any>(null);
  const [suggestedReplaces, setSuggestedReplaces] = useState<any[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [currentStatus, setCurrentStatus] = useState(status);
  const [progressMessage, setProgressMessage] = useState(
    "AI is crafting your document..."
  );
  const isMobile = useMediaQuery("(max-width: 768px)");

  const generatingMessages = [
    "AI is outlining your structure...",
    "AI is writing the introduction...",
    "AI is building main sections...",
    "AI is adding conclusion and references...",
    "AI is finalizing layout...",
  ];

  // Debounce save function
  const debouncedSave = useCallback(
    (html: string) => {
      const timeoutId = setTimeout(async () => {
        setAutoSaveStatus("saving");
        try {
          await saveContentToDB(html);
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } catch (err) {
          console.error("Auto-save error:", err);
          setAutoSaveStatus("idle");
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    },
    [documentId]
  );

  const saveContentToDB = async (html: string, newStatus?: string) => {
    try {
      const body: any = {
        documentId,
        content: html,
      };
      if (newStatus) {
        body.status = newStatus;
      }
      await fetch("/api/document/update", {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error("Auto-save error:", err);
      throw err;
    }
  };

  const handleContentChange = (html: string) => {
    setContent(html);
    debouncedSave(html);
  };

  const scanDocument = async (html: string) => {
    try {
      const res = await fetch("/api/document/ai/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: html, documentId }),
      });
      const data = await res.json();
      setScanData(data);
      setSuggestedReplaces(data.suggestedReplaces || []);
      if (data.needsUpdate) {
        setShowModal(true);
      }
    } catch (err) {
      console.error("Scan failed:", err);
    }
  };

  const handleScanConfirm = async () => {
    setShowScanDialog(false);
    if (content) {
      await scanDocument(content);
    }
  };

  const handleModalUpdate = (updates: Record<string, string>) => {
    // Sync updates if needed, e.g., to replaces or chat
    console.log("Updated fields:", updates);
  };

  const renderWord = async (dataUrl: string) => {
    try {
      let arrayBuffer = await fetch(dataUrl).then((res) => res.arrayBuffer());

      const zip = await JSZip.loadAsync(arrayBuffer);
      if (!zip.file("word/numbering.xml")) {
        const dummyNumbering = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
</w:numbering>`;
        zip.file("word/numbering.xml", dummyNumbering);
        arrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
      }

      const converter = await DocxToHtmlConverter.create(arrayBuffer, {
        useDefaultValues: true,
      });

      const html = converter.convertToHtml();
      setContent(html);
      // Initial save with status update
      setAutoSaveStatus("saving");
      await saveContentToDB(html, "ready");
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 2000);
      setCurrentStatus("ready");
      setShowScanDialog(true);
    } catch (error) {
      console.error("Word render error:", error);
      setContent("<p>Failed to load Word document.</p>");
      setAutoSaveStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  // Poll for status/content if generating
  const pollStatus = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/document/${documentId}`, {
          method: "GET",
          cache: "no-store",
        });
        const { document } = await res.json();
        setCurrentStatus(document.status);

        if (document.status === "ready") {
          setContent(document.content || "");
          setReferences(document.references || []);
          setLoading(false);
          clearInterval(interval);
          // Auto-save (though already saved server-side)
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
          setShowScanDialog(true);
        } else if (document.status === "generating") {
          // Staged messages for "real-time progress"
          setProgressMessage(
            generatingMessages[
              Math.floor(Math.random() * generatingMessages.length)
            ]
          );
        } else if (document.status === "error") {
          setContent("<p>Generation failed. Please try again.</p>");
          setLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [documentId]);

  // Fetch initial document state for pending/generating cases
  const fetchInitialDocument = useCallback(async () => {
    try {
      const res = await fetch(`/api/document/${documentId}`, {
        method: "GET",
        cache: "no-store",
      });
      const { document } = await res.json();
      const docStatus = document.status;
      setCurrentStatus(docStatus);

      const trimmedContent = document.content ? document.content.trim() : "";
      if (
        document.content &&
        trimmedContent !== "" &&
        trimmedContent !== "{}" &&
        trimmedContent.length > 2
      ) {
        setContent(document.content);
        setReferences(document.references || []);
        setLoading(false);
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
        setShowScanDialog(true);
        return { handled: true, status: docStatus };
      } else if (docStatus === "error") {
        setContent("<p>Document generation failed. Please try again.</p>");
        setLoading(false);
        return { handled: true, status: docStatus };
      } else if (docStatus === "ready") {
        setContent(
          "<p>Document is ready but has no content. This may be an error. Please refresh the page.</p>"
        );
        setLoading(false);
        return { handled: true, status: docStatus };
      }
      return { handled: false, status: docStatus };
    } catch (err) {
      console.error("Initial fetch error:", err);
      setContent("<p>Failed to load document.</p>");
      setLoading(false);
      return { handled: true, status: "error" };
    }
  }, [documentId]);

  useEffect(() => {
    const processFile = async () => {
      setLoading(true);
      // Always fetch initial state first
      const { handled, status: fetchedStatus } = await fetchInitialDocument();
      if (!handled) {
        if (fetchedStatus === "generating") {
          // Already generating, just poll
          pollStatus();
        } else if (fileData && fileType) {
          // Process uploaded file (e.g., Word/HTML)
          await handleFileData(fileData, fileType);
        } else {
          try {
            await fetch(`/api/document/${documentId}/generate`, {
              method: "POST",
            });
            // Start polling
            pollStatus();
          } catch (err) {
            console.error("Trigger generate error:", err);
            setContent("<p>Failed to start generation.</p>");
            setLoading(false);
          }
        }
      }
    };
    processFile();
  }, [fileType, fileData, documentId, fetchInitialDocument, pollStatus]);

  const handleFileData = async (fileDataUrl: string, fileType: string) => {
    if (!fileDataUrl || !fileType) {
      setContent("<p>No file data provided.</p>");
      setLoading(false);
      return;
    }

    try {
      if (
        fileType.includes("wordprocessingml") ||
        fileType.includes("msword")
      ) {
        await renderWord(fileDataUrl);
      } else if (fileType.includes("html")) {
        // Direct HTML from upload, fetch the content
        const htmlContent = await fetch(fileDataUrl).then((res) => res.text());
        setContent(htmlContent);
        setAutoSaveStatus("saving");
        await saveContentToDB(htmlContent, "ready");
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
        setCurrentStatus("ready");
        setShowScanDialog(true);
        setLoading(false);
      } else {
        setContent("<p>Unsupported file format.</p>");
        setAutoSaveStatus("idle");
        setLoading(false);
      }
    } catch (error) {
      console.error("handleFileData error:", error);
      setContent("<p>Failed to process document.</p>");
      setAutoSaveStatus("idle");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <AILoadingSkeleton
          messages={
            currentStatus === "generating"
              ? generatingMessages
              : ["Processing document..."]
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground flex-col">
        {/* Sticky Header with Toolbar */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="mx-auto px-6 py-2">
            {editor && (
              <EditorToolbar
                editor={editor}
                autoSaveStatus={autoSaveStatus}
                documentId={documentId}
              />
            )}
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Main Document Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-[850px] my-8 bg-white border border-border min-h-[1100px] px-12 py-16">
                <TextEditor
                  initialContent={content}
                  className="min-h-full"
                  onEditorReady={setEditor}
                  onContentChange={handleContentChange}
                  documentId={documentId}
                />
              </div>
            </div>
          </div>

          {/* Desktop: sidebar visible on right, Mobile: overlay on top */}
          {isMobile ? (
            <>
              {sidebarOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <div className="fixed right-0 top-0 z-50 h-screen w-[320px] border-l border-border bg-background md:hidden">
                    <SmartSidebar
                      className="h-full"
                      onClose={() => setSidebarOpen(false)}
                      isOpen={sidebarOpen}
                      editor={editor}
                      documentId={documentId}
                      suggestedReplaces={suggestedReplaces}
                      onReplacesUpdate={setSuggestedReplaces}
                    />
                  </div>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed bottom-6 right-6 z-30 gap-2 bg-background border border-border hover:bg-muted rounded-full px-3 h-10 shadow-sm"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <PanelRightOpen className="h-4 w-4" />
                {!sidebarOpen && (
                  <span className="text-sm font-medium">Open Sidebar</span>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="relative items-start hidden md:flex">
                <div
                  className={`h-full overflow-hidden transition-all duration-300 ease-in-out ${
                    sidebarOpen ? "w-[380px]" : "w-0"
                  }`}
                >
                  <div className="w-[380px] h-full border-l border-border bg-background/50">
                    <SmartSidebar
                      className="h-full"
                      onClose={() => setSidebarOpen(false)}
                      isOpen={sidebarOpen}
                      editor={editor}
                      documentId={documentId}
                      suggestedReplaces={suggestedReplaces}
                      onReplacesUpdate={setSuggestedReplaces}
                      references={references}
                    />
                  </div>
                </div>

                {!sidebarOpen && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidebarOpen(true)}
                        className="absolute right-8 top-5 z-30 h-9 rounded-full hover:bg-muted transition-all bg-background border-border"
                        aria-label="Open sidebar"
                      >
                        <PanelRightOpen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Open Smart Assistant</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Update Modal */}
      <UpdateDetailsModal
        open={showModal}
        onOpenChange={setShowModal}
        scanData={scanData}
        editor={editor}
        onUpdate={handleModalUpdate}
      />

      {/* Scan Confirmation Dialog */}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan for Quick Edits?</DialogTitle>
            <DialogDescription>
              Would you like AI to scan the document for quick edits?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScanConfirm}>Scan Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
