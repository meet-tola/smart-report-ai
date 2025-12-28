/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef, useReducer } from "react";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToolbarProvider } from "./toolbar-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { Editor } from "@tiptap/core";
import { UndoToolbar } from "./undo";
import { RedoToolbar } from "./redo";
import { HeadingsToolbar } from "./headings";
import { BlockquoteToolbar } from "./blockquote";
import { CodeToolbar } from "./code";
import { BoldToolbar } from "./bold";
import { ItalicToolbar } from "./italic";
import { UnderlineToolbar } from "./underline";
import { StrikeThroughToolbar } from "./strikethrough";
import { BulletListToolbar } from "./bullet-list";
import { OrderedListToolbar } from "./ordered-list";
import { HorizontalRuleToolbar } from "./horizontal-rule";
import { AlignmentTooolbar } from "./alignment";
import { ImagePlaceholderToolbar } from "./image-placeholder-toolbar";
import { ColorHighlightToolbar } from "./color-and-highlight";
import { SearchAndReplaceToolbar } from "./search-and-replace-toolbar";
import { CodeBlockToolbar } from "./code-block";
import { FontFamilyToolbar } from "./font-family-toolbar";
import {
  Share2,
  Clock,
  MoreHorizontal,
  Link,
  FileJson,
  FileText,
  Circle,
  Heading,
  Sparkles,
  Loader2,
} from "lucide-react";
import { LineHeightToolbar } from "./line-height";
import { BlockFormatToolbar } from "./block-format-toolbar";
import { FontSizeToolbar } from "./font-size";
import { AskAIPopup } from "../ask-ai-popup";

interface EditorToolbarProps {
  editor: Editor;
  autoSaveStatus: "idle" | "saving" | "saved";
  documentId: string; // Add this prop!
}

interface Version {
  id: string;
  name: string;
  version: number;
  createdAt: string;
}

export const EditorToolbar = ({
  editor,
  autoSaveStatus,
  documentId,
}: EditorToolbarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAskAI, setShowAskAI] = useState(false);
  const [savedSelectedText, setSavedSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState({ from: 0, to: 0 });
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const aiButtonRef = useRef<HTMLButtonButton>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Version History State
  const [versions, setVersions] = useState<Version[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(
    null
  );
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);

  // Fetch versions when menu opens
  const fetchVersions = async () => {
    if (versions.length > 0) return;

    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/document/${documentId}/versions`);
      if (res.ok) {
        const { versions: fetched } = await res.json();
        setVersions(fetched);
      }
    } catch (err) {
      console.error("Failed to load versions:", err);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Restore a version
  const restoreVersion = async (versionId: string) => {
    setRestoringVersionId(versionId);
    try {
      const res = await fetch(`/api/document/${documentId}/versions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });

      if (res.ok) {
        // Reload the page or trigger editor update
        window.location.reload(); // Simple way – or emit event if you prefer
      } else {
        alert("Failed to restore version");
      }
    } catch (err) {
      console.error("Restore failed:", err);
      alert("Failed to restore version");
    } finally {
      setRestoringVersionId(null);
    }
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    const isYesterday =
      date.toDateString() ===
      new Date(now.setDate(now.getDate() - 1)).toDateString();
    if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      ` at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    );
  };

  const handleAIAsk = () => {
    // ... your existing AI logic
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    if (!text.trim()) return;

    setSavedSelectedText(text);
    setSelectionRange({ from, to });

    if (aiButtonRef.current) {
      const rect = aiButtonRef.current.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 10,
      });
    }
    setShowAskAI(true);
  };

  const handleClosePopup = () => {
    setShowAskAI(false);
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm">
      <ToolbarProvider editor={editor}>
        <TooltipProvider>
          <div className="flex items-center gap-1 px-3 py-2 h-12">
            {/* Primary Tools - Always Visible */}
            <div className="flex items-center gap-1">
              <UndoToolbar />
              <RedoToolbar />
            </div>

            <Separator orientation="vertical" className="mx-0.5 h-6" />
            <div className="hidden sm:flex items-center gap-1">
              <FontFamilyToolbar editor={editor} />
            </div>

            {/* Common Formatting Tools - Visible on all screens */}
            <div className="flex items-center gap-1">
              <BoldToolbar />
              <ItalicToolbar />
              <UnderlineToolbar />
              <FontSizeToolbar />
              <ColorHighlightToolbar />
            </div>

            {/* Desktop Structure Tools - Visible on sm+ */}
            <div className="hidden sm:flex items-center gap-1">
              <BlockFormatToolbar />
              <LineHeightToolbar />
              <AlignmentTooolbar />
              <BulletListToolbar />
              <OrderedListToolbar />

              {/* Utility Tools - More Options Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="More tools"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Additional Formatting Tools */}
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Formatting
                    </p>
                  </div>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <StrikeThroughToolbar />
                    <span className="text-sm">Strikethrough</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <BlockquoteToolbar />
                    <span className="text-sm">Quote</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <CodeToolbar />
                    <span className="text-sm">Code</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <CodeBlockToolbar />
                    <span className="text-sm">Code Block</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <HorizontalRuleToolbar />
                    <span className="text-sm">Horizontal Rule</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Structure Dropdown - Visible on sm- */}
            <div className="flex sm:hidden items-center gap-1">
              <Separator orientation="vertical" className="mx-0.5 h-6" />
              <DropdownMenu open={isExpanded} onOpenChange={setIsExpanded}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Structure options"
                  >
                    <Heading className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <HeadingsToolbar />
                    <span className="text-sm">Headings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <LineHeightToolbar />
                    <span className="text-sm">Line Height</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <AlignmentTooolbar />
                    <span className="text-sm">Alignment</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <BulletListToolbar />
                    <span className="text-sm">Bullet List</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <OrderedListToolbar />
                    <span className="text-sm">Ordered List</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Separator before autosave (only on desktop to separate from structure) */}
            <div className="hidden sm:block mx-0.5">
              <Separator orientation="vertical" className="h-6" />
            </div>

            <div className="flex items-center gap-1.5 ml-1 px-2 py-1 rounded-sm text-xs text-muted-foreground">
              {autoSaveStatus === "saving" && (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" />
                  <span className="hidden sm:inline">Autosaving...</span>
                </>
              )}
              {autoSaveStatus === "saved" && (
                <>
                  <span className="hidden sm:inline">Saved</span>
                </>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Secondary Tools - Hidden on very small screens */}
            <div className="hidden md:flex items-center gap-1">
              <Separator orientation="vertical" className="mx-0.5 h-6" />
              <SearchAndReplaceToolbar />
              <Button
                ref={aiButtonRef}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleAIAsk}
                title="Ask AI"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <ImagePlaceholderToolbar />
            </div>

            <Separator orientation="vertical" className="mx-0.5 h-6" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2"
                  title="Share options"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline md:hidden lg:hidden text-sm">
                    Share
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">
                  Share Options
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Copy Share Link</div>
                    <div className="text-xs text-muted-foreground">
                      Get shareable link
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">
                  Export As
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Export as PDF</div>
                    <div className="text-xs text-muted-foreground">.pdf</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <FileJson className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Export as JSON</div>
                    <div className="text-xs text-muted-foreground">.json</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

              {/* Version History Dropdown */}
              <DropdownMenu
                open={versionMenuOpen}
                onOpenChange={(open) => {
                  setVersionMenuOpen(open);
                  if (open) fetchVersions();
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2"
                    title="Version history"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">History</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 max-h-96 overflow-y-auto"
                >
                  <DropdownMenuLabel className="text-xs flex items-center justify-between">
                    Version History
                    {loadingVersions && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {loadingVersions ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Loading versions...
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No saved versions yet
                    </div>
                  ) : (
                    versions.map((version) => (
                      <DropdownMenuItem
                        key={version.id}
                        className="flex items-start gap-3 py-3 cursor-pointer focus:bg-accent"
                        onClick={() => restoreVersion(version.id)}
                        disabled={!!restoringVersionId}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {version.name}
                            {restoringVersionId === version.id && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(version.createdAt)}
                          </div>
                        </div>
                        {/* You could show a check if this is the current version */}
                        {/* Or compare with main document's latest version field */}
                        <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      </DropdownMenuItem>
                    ))
                  )}

                  {versions.length > 0 && <DropdownMenuSeparator />}
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </TooltipProvider>
      </ToolbarProvider>

      {/* AI Popup */}
      {showAskAI && (
        <AskAIPopup
          selectedText={savedSelectedText}
          position={popupPosition}
          onClose={handleClosePopup}
          editor={editor}
          selectionRange={selectionRange}
        />
      )}
    </div>
  );
};
