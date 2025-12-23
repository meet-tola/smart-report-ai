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
  name: "fontFamily",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) =>
              element.style.fontFamily?.replace(/['"]/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {};
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
        },
      },
    ];
  },
});

interface TextEditorEnhancedProps {
  className?: string;
  initialContent?: string;
  initialFont?: string;
  onEditorReady?: (editor: any) => void;
  onContentChange?: (html: string) => void;
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
}: TextEditorEnhancedProps) {
  const [showAskAI, setShowAskAI] = useState(false);
  const [savedSelectedText, setSavedSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const floatingButtonRef = useRef<HTMLButtonElement>(null);
  const floatingContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastScrollYRef = useRef<number>(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    content: initialContent ? `${initialContent}` : "",
    editorProps: {
      attributes: {
        class: "max-w-full focus:outline-none",
        style: initialFont ? `font-family:'${initialFont}'` : "",
      },
    },
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
      console.log(editor.getText());
    },
    onCreate: ({ editor }) => {
      if (onEditorReady) {
        onEditorReady(editor);
      }
    },
  });

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
        // Position centered above the selection like a tooltip
        const toolbarHeight = 40;
        const marginAbove = 20;

        // Ensure position is within viewport
        const viewportWidth = window.innerWidth;
        // const viewportHeight = window.innerHeight;

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
      // Only hide if there's actual vertical scroll
      if (Math.abs(e.deltaY) > 1) {
        hideUIOnScroll();
      }
    },
    [hideUIOnScroll]
  );

  // Handle touch events for mobile/trackpad
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
        // Delay slightly to ensure DOM update
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

    // Add multiple event listeners for different scroll/touch scenarios
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
  editor
    .chain()
    .setTextSelection({ from, to })
    .setSelectionHighlight()
    .run();

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
