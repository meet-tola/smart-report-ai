"use client";

import { useState } from "react";
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
  CheckCircle,
  Circle,
  Heading,
} from "lucide-react";
import { LineHeightToolbar } from "./line-height";

interface EditorToolbarProps {
  editor: Editor;
  autoSaveStatus: "idle" | "saving" | "saved";
}

export const EditorToolbar = ({
  editor,
  autoSaveStatus,
}: EditorToolbarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="sticky top-0 z-20 w-full bg-background/95 backdrop-blur-sm">
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
            </div>

            {/* Desktop Structure Tools - Visible on sm+ */}
            <div className="hidden sm:flex items-center gap-1">
              <HeadingsToolbar />
              <LineHeightToolbar />
              <Separator orientation="vertical" className="mx-0.5 h-6" />
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
              <ImagePlaceholderToolbar />
              <ColorHighlightToolbar />
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
                  <span className="hidden sm:inline text-sm">Share</span>
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

            <DropdownMenu>
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">
                  Version History
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-start gap-3 cursor-pointer py-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Current Version</div>
                    <div className="text-xs text-muted-foreground">
                      Today at 2:45 PM
                    </div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-start gap-3 cursor-pointer py-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Draft saved</div>
                    <div className="text-xs text-muted-foreground">
                      Today at 1:20 PM
                    </div>
                  </div>
                  <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start gap-3 cursor-pointer py-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Major revision</div>
                    <div className="text-xs text-muted-foreground">
                      Yesterday at 5:00 PM
                    </div>
                  </div>
                  <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      </ToolbarProvider>
    </div>
  );
};
