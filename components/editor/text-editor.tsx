/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import "./tiptap.css"
import { cn } from "@/lib/utils"
import { ImageExtension } from "@/components/editor/extensions/image"
import { ImagePlaceholder } from "@/components/editor/extensions/image-placeholder"
import SearchAndReplace from "@/components/editor/extensions/search-and-replace"
import { Color } from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import TextAlign from "@tiptap/extension-text-align"
import { LineHeight, TextStyle } from "@tiptap/extension-text-style"
import Typography from "@tiptap/extension-typography"
import Underline from "@tiptap/extension-underline"
import { EditorContent, Extension, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { FloatingToolbar } from "@/components/editor/extensions/floating-toolbar"
import Placeholder from "@tiptap/extension-placeholder"
import { AskAIPopup } from "./ask-ai-popup"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { TipTapFloatingMenu } from "./extensions/floating-menu"

const FontFamily = Extension.create({
  name: "fontFamily",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily?.replace(/['"]/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {}
              return { style: `font-family: ${attributes.fontFamily}` }
            },
          },
        },
      },
    ]
  },
})

interface TextEditorEnhancedProps {
  className?: string
  initialContent?: string
  initialFont?: string
  onEditorReady?: (editor: any) => void
  onContentChange?: (html: string) => void 
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
          return `Heading ${node.attrs.level}`
        case "detailsSummary":
          return "Section title"
        case "codeBlock":
          return ""
        default:
          return "Write or type '/' for AI to get help...  "
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TextStyle,
  LineHeight,
  FontFamily,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
  Typography,
]

export function TextEditor({ className, initialContent, initialFont, onEditorReady, onContentChange }: TextEditorEnhancedProps) {
  const [showAskAI, setShowAskAI] = useState(false)
  const [savedSelectedText, setSavedSelectedText] = useState("") // Renamed for clarity; now saved on open
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

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
      console.log(editor.getText())
    },
    onCreate: ({ editor }) => {
      if (onEditorReady) {
        onEditorReady(editor)
      }
    },
  })

  useEffect(() => {
  if (!editor) return

  const handleSelectionChange = () => {
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, " ")

    if (text.trim().length > 0) {
      setSavedSelectedText(text) 
      if (!showAskAI) {
        // Only show the button if popup isn't already open
      }
      return
    }

    if (!showAskAI) {
      setSavedSelectedText("")
    }
  }

  editor.on("selectionUpdate", handleSelectionChange)

  const handleWindowMouseUp = () => {
    if (showAskAI) return

    const selection = window.getSelection()
    if (!selection || selection.toString().trim().length === 0) {
      setSavedSelectedText("")
    }
  }

  window.addEventListener("mouseup", handleWindowMouseUp)

  return () => {
    editor.off("selectionUpdate", handleSelectionChange)
    window.removeEventListener("mouseup", handleWindowMouseUp)
  }
}, [editor, showAskAI])


  const handleAskAIClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!editor) return
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, " ")
    setSavedSelectedText(text)
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setPopupPosition({
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 10,
      })
      setShowAskAI(true)
    }
  }

  const handleClosePopup = () => {
    setShowAskAI(false)
  }

  if (!editor) return null

  return (
    <div className={cn("relative", className)}>
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} />

      {savedSelectedText && !showAskAI && (
        <div
          className="fixed z-40 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${window.getSelection()?.rangeCount ? window.getSelection()?.getRangeAt(0).getBoundingClientRect().right : 0}px`,
            top: `${window.getSelection()?.rangeCount ? window.getSelection()?.getRangeAt(0).getBoundingClientRect().top : 0}px`,
            transform: "translate(10px, -5px)",
          }}
        >
          <Button
            size="sm"
            variant="default"
            className="h-8 gap-1.5 shadow-sm rounded-full px-3 text-xs"
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
          position={popupPosition} 
          onClose={handleClosePopup}
          editor={editor} 
          selectionRange={{ from: editor.state.selection.from, to: editor.state.selection.to }}
        />
      )}

      <EditorContent editor={editor} className="prose max-w-none " />
    </div>
  )
}