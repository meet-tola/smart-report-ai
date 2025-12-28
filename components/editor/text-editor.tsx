/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import "./tiptap.css";
import { cn } from "@/lib/utils";
import { ImageExtension } from "@/components/editor/extensions/image";
import { ImagePlaceholder } from "@/components/editor/extensions/image-placeholder";
import SearchAndReplace from "@/components/editor/extensions/search-and-replace";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize, LineHeight, TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FloatingToolbar } from "@/components/editor/extensions/floating-toolbar";
import Placeholder from "@tiptap/extension-placeholder";
import { AskAIPopup } from "./ask-ai-popup";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { TipTapFloatingMenu } from "./extensions/floating-menu";
import { ToolbarProvider } from "@/components/editor/toolbars/toolbar-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import { BoldToolbar } from "@/components/editor/toolbars/bold";
import { ItalicToolbar } from "@/components/editor/toolbars/italic";
import { UnderlineToolbar } from "@/components/editor/toolbars/underline";
import { StrikeThroughToolbar } from "@/components/editor/toolbars/strikethrough";
import { ColorHighlightToolbar } from "@/components/editor/toolbars/color-and-highlight";
import { SelectionHighlight } from "./extensions/selection-highlight";

const FontFamily = Extension.create({
  name: 'fontFamily',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily.replace(/['"]/g, '') || null,
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {};
              }
              return {
                style: `font-family: "${attributes.fontFamily}"`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily: (fontFamily: string) => ({ commands }) => {
        return commands.setMark('textStyle', { fontFamily });
      },
      unsetFontFamily: () => ({ commands }) => {
        return commands.unsetMark('textStyle', { fontFamily: null });
      },
    };
  },
});

interface TextEditorEnhancedProps {
  className?: string;
  initialContent?: string;
  initialFont?: string;
  onEditorReady?: (editor: any) => void;
  onContentChange?: (html: string) => void;
  documentId: string;
}

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc",
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Placeholder.configure({
    emptyNodeClass: "is-editor-empty",
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case "heading":
          return `Heading ${node.attrs.level}`;
        case "detailsSummary":
          return "Section title";
        case "codeBlock":
          return "";
        default:
          return "Write or type '/' for AI to get help...  ";
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TextStyle,
  LineHeight,
  FontSize,
  FontFamily,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  SelectionHighlight,
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
  Typography,
];

export function TextEditor({
  className,
  initialContent,
  initialFont,
  onEditorReady,
  onContentChange,
  documentId,
}: TextEditorEnhancedProps) {
  const lastSavedContent = useRef<string>("");
  const [showAskAI, setShowAskAI] = useState(false);
  const [savedSelectedText, setSavedSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const floatingButtonRef = useRef<HTMLButtonElement>(null);
  const floatingContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastScrollYRef = useRef<number>(0);

  const editor = useEditor({
  immediatelyRender: false,
  extensions: extensions as Extension[],
  content: initialContent || "",
  editorProps: {
    attributes: {
      class: "max-w-full focus:outline-none prose max-w-none",
      style: "font-family: 'Times New Roman', Times, serif;",
      ...(initialFont && {
        style: `font-family: '${initialFont}', 'Times New Roman', Times, serif;`,
      }),
    },
  },
  onCreate: ({ editor }) => {
    if (onEditorReady) {
      onEditorReady(editor);
    }

    const fontToApply = initialFont || "Times New Roman";

    editor.commands.setFontFamily(fontToApply);

    lastSavedContent.current = JSON.stringify(editor.getJSON());
  },
  onUpdate: ({ editor }) => {
    if (onContentChange) {
      onContentChange(editor.getHTML());
    }
  },
});

  const createVersion = useCallback(
  async (name: string) => {
    if (!editor || !documentId) return;

    const jsonContent = editor.getJSON();
    const contentStr = JSON.stringify(jsonContent);

    if (contentStr === lastSavedContent.current) return;

    try {
      const res = await fetch(`/api/document/${documentId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content: jsonContent }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save version: ${errorText}`);
      }
      lastSavedContent.current = contentStr;
    } catch (err) {
      console.error("Version save error:", err);
    }
  },
  [editor, documentId] 
);

  useEffect(() => {
  if (!documentId) return;

  const interval = setInterval(() => {
    const date = new Date();
    const name = `Auto Draft - ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;

    createVersion(name);
  }, 36000); 

  return () => clearInterval(interval);
}, [createVersion, documentId]); 

  // Function to load versions (call in UI)
  const loadVersions = useCallback(async () => {
    const res = await fetch(`/api/document/${documentId}/versions`);
    const { versions } = await res.json();
    return versions;
  }, [documentId]);

  // Function to restore a version
  const restoreVersion = useCallback(
    async (versionId: string) => {
      try {
        const res = await fetch(`/api/document/${documentId}/versions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId }),
        });
        if (!res.ok) throw new Error("Restore failed");

        const updatedDoc = await fetch(`/api/document/${documentId}`);
        const { document } = await updatedDoc.json();
        const jsonContent = JSON.parse(document.content);
        editor?.commands.setContent(jsonContent);
        lastSavedContent.current = document.content;

      } catch (err) {
        console.error("Restore error:", err);
      }
    },
    [editor, documentId]
  );

  const updateButtonPosition = useCallback(() => {
    if (!editor || !savedSelectedText) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      setSavedSelectedText("");
      return;
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        const toolbarHeight = 40;
        const marginAbove = 20;

        const viewportWidth = window.innerWidth;

        let x = rect.left + rect.width / 2;
        let y = rect.top - toolbarHeight - marginAbove;

        // Keep toolbar within viewport bounds
        if (y < 10) y = 10;
        if (x < 100) x = 100;
        if (x > viewportWidth - 100) x = viewportWidth - 100;

        setButtonPosition({
          x: x,
          y: y,
        });
      } else {
        setSavedSelectedText("");
      }
    } else {
      setSavedSelectedText("");
    }
  }, [editor, savedSelectedText]);

  // Handle scroll to hide toolbar and AskAI popup
  const hideUIOnScroll = useCallback(() => {
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a new timeout to hide UI after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      // Hide toolbar when scrolling
      if (savedSelectedText && !showAskAI) {
        setSavedSelectedText("");
      }

      // Hide AskAI popup when scrolling
      if (showAskAI) {
        setShowAskAI(false);
        if (window.getSelection()) {
          window.getSelection()?.removeAllRanges();
        }
        setSavedSelectedText("");
      }
    }, 50); // 50ms delay to detect scroll end
  }, [savedSelectedText, showAskAI]);

  // Handle wheel events (for trackpads and mouse wheels)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 1) {
        hideUIOnScroll();
      }
    },
    [hideUIOnScroll]
  );

  const handleTouchStart = useCallback(() => {
    lastScrollYRef.current = window.scrollY;
  }, []);

  const handleTouchMove = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - lastScrollYRef.current) > 5) {
      hideUIOnScroll();
    }
    lastScrollYRef.current = currentScrollY;
  }, [hideUIOnScroll]);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionChange = () => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");

      if (text.trim().length > 0) {
        setSavedSelectedText(text);
        requestAnimationFrame(() => {
          updateButtonPosition();
        });
        return;
      }

      if (!showAskAI) {
        setSavedSelectedText("");
      }
    };

    editor.on("selectionUpdate", handleSelectionChange);

    const handleWindowMouseUp = () => {
      if (showAskAI) return;

      const selection = window.getSelection();
      if (!selection || selection.toString().trim().length === 0) {
        setSavedSelectedText("");
      }
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("scroll", hideUIOnScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      editor.off("selectionUpdate", handleSelectionChange);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("scroll", hideUIOnScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);

      // Clear timeout on cleanup
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [
    editor,
    showAskAI,
    updateButtonPosition,
    hideUIOnScroll,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
  ]);

  const handleAskAIClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editor) return;

    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");

    if (text.trim().length === 0) return;

    setSavedSelectedText(text);
    setSelectionRange({ from, to });

    // Apply fake highlight on the exact range
    editor.chain().setTextSelection({ from, to }).setSelectionHighlight().run();

    // Hide floating toolbar
    setSavedSelectedText("");

    // Position popup below selection
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        const marginBelow = 10;
        let x = rect.left + rect.width / 2;
        const y = rect.bottom + marginBelow;

        const viewportWidth = window.innerWidth;
        if (x < 100) x = 100;
        if (x > viewportWidth - 100) x = viewportWidth - 100;

        setButtonPosition({ x, y });
      }
    }

    setShowAskAI(true);
  };

  const handleClosePopup = () => {
    setShowAskAI(false);
    setSavedSelectedText("");
    setSelectionRange(null); // clear it

    if (editor && selectionRange) {
      editor
        .chain()
        .setTextSelection(selectionRange)
        .unsetSelectionHighlight()
        .run();
    }

    window.getSelection()?.removeAllRanges();
  };

  // Clear selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showAskAI) {
        const popupElement = document.querySelector("[data-ask-ai-popup]");
        const isPopupClick = popupElement?.contains(e.target as Node);
        const isEditorClick = editor?.view.dom.contains(e.target as Node);
        const isFloatingToolbar = floatingContainerRef.current?.contains(
          e.target as Node
        );

        if (!isPopupClick && !isEditorClick && !isFloatingToolbar) {
          handleClosePopup();
        }
        return;
      }

      const target = e.target as HTMLElement;
      const editorElement = editor?.view.dom;
      const isEditorClick = editorElement?.contains(target);
      const isFloatingToolbar = floatingContainerRef.current?.contains(target);

      if (!isEditorClick && !isFloatingToolbar) {
        setSavedSelectedText("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editor, showAskAI]);

  // Hide toolbar when AskAI is shown
  useEffect(() => {
    if (showAskAI && savedSelectedText) {
      // We keep savedSelectedText for the popup, but hide the toolbar
    }
  }, [showAskAI, savedSelectedText]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) return null;

  return (
    <div className={cn("relative", className)}>
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} />

      {savedSelectedText && !showAskAI && (
        <div
          ref={floatingContainerRef}
          className="fixed z-50 animate-in fade-in zoom-in-95 duration-200 bg-white rounded-lg shadow-lg border flex items-center gap-1 p-1"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
            transform: "translateX(-50%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipProvider>
            <ToolbarProvider editor={editor}>
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <BoldToolbar />
                <ItalicToolbar />
                <UnderlineToolbar />
                <StrikeThroughToolbar />
                <ColorHighlightToolbar />
              </div>
            </ToolbarProvider>
          </TooltipProvider>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <Button
            ref={floatingButtonRef}
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 rounded px-2 text-xs whitespace-nowrap"
            onClick={handleAskAIClick}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask AI
          </Button>
        </div>
      )}

      {showAskAI && (
        <AskAIPopup
          selectedText={savedSelectedText}
          position={buttonPosition}
          onClose={handleClosePopup}
          editor={editor}
          selectionRange={selectionRange!}
        />
      )}

      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  );
}
