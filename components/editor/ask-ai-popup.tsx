/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ArrowUp,
  Clipboard,
  Check,
  PenTool,
  SpellCheck,
  FileText,
  Expand,
  Shrink,
  Languages,
  Search,
  HelpCircle,
  Globe,
} from "lucide-react";
import { Editor } from "@tiptap/core";
import { cn } from "@/lib/utils";

interface AskAIPopupProps {
  selectedText: string;
  position?: { x: number; y: number };
  onClose: () => void;
  editor: Editor | null;
  selectionRange: { from: number; to: number };
}

interface AIResponse {
  response: string;
  suggestedAction?: {
    type: "replace" | "insert";
    content: string;
    reason: string;
  };
}

const suggestionGroups = [
  {
    title: "Improve writing",
    items: [
      {
        label: "Improve writing",
        icon: PenTool,
        question: "Improve the writing style and clarity of this text.",
      },
      {
        label: "Fix spelling & grammar",
        icon: SpellCheck,
        question: "Fix spelling, grammar, and improve clarity.",
      },
      {
        label: "Summarize",
        icon: FileText,
        question: "Summarize this text concisely.",
      },
    ],
  },
  {
    title: "Edit",
    items: [
      {
        label: "Make longer",
        icon: Expand,
        question: "Expand on this idea with more details and examples.",
      },
      {
        label: "Make shorter",
        icon: Shrink,
        question: "Make this text shorter while keeping the key points.",
      },
      {
        label: "Simplify language",
        icon: Languages,
        question: "Simplify the language to make it easier to understand.",
      },
    ],
  },
  {
    title: "Find / Search",
    items: [
      {
        label: "Find online references",
        icon: Search,
        question: "Find reliable online sources or references for this topic.",
      },
      {
        label: "Ask a question...",
        icon: HelpCircle,
        question: "Ask AI a custom question about the selected text:",
      },
      {
        label: "Ask about the page...",
        icon: Globe,
        question: "Tell me more about the context or source of this content.",
      },
    ],
  },
];

export function AskAIPopup({
  selectedText,
  position,
  onClose,
  editor,
  selectionRange,
}: AskAIPopupProps) {
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!popupRef.current) return;
      if (popupRef.current.contains(e.target as Node)) return;
      if (editor?.view.dom.contains(e.target as Node)) return;
      onClose();
    };

    // Use capture phase for more reliable detection
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [onClose, editor]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAskAI = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError("");
    setAiResponse(null);

    try {
      const res = await fetch("/api/document/ai/popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          context: selectedText,
          action: question.toLowerCase().includes("rewrite")
            ? "rewrite"
            : question.toLowerCase().includes("summarize")
            ? "summarize"
            : "general",
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = (await res.json()) as AIResponse;
      setAiResponse(data);
    } catch (err) {
      setError("Failed to get AI response. Try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  const handleApply = () => {
    if (!editor || !aiResponse?.suggestedAction) return;

    const { content } = aiResponse.suggestedAction;
    editor
      .chain()
      .focus()
      .setTextSelection(selectionRange)
      .deleteSelection()
      .insertContent(content)
      .run();

    setApplied(true);
    setTimeout(onClose, 1000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const popupStyle = position
    ? {
        position: "fixed" as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
      }
    : {
        position: "fixed" as const,
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
      };

  return (
    <div
      ref={popupRef}
      style={popupStyle}
      className="w-full max-w-lg"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Minimal Input with Arrow Button */}
      <div className="bg-background rounded-xl shadow-lg border overflow-hidden">
        <div className="relative p-1.5">
          <Input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI about the selected text..."
            className="h-12 pr-14 text-base border-0 focus-visible:ring-0 shadow-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleAskAI}
            disabled={isLoading || !question.trim()}
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full"
          >
            {isLoading ? (
              <Sparkles className="h-4 w-4 animate-pulse" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Scrollable Dropdown with Groups and Icons */}
      <div className="mt-1.5 w-full max-w-xs">
        <div className="bg-background rounded-xl shadow-lg border overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-2">
            {" "}
            {/* Fixed height + scrollable */}
            {suggestionGroups.map((group, groupIdx) => (
              <div key={group.title}>
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setQuestion(item.question);
                        inputRef.current?.focus();
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                {groupIdx < suggestionGroups.length - 1 && (
                  <div className="mx-4 my-1 border-t border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 text-center text-sm text-destructive">{error}</div>
      )}

      {/* AI Response */}
      {aiResponse && (
        <div className="mt-4 bg-background rounded-2xl shadow-2xl border p-5">
          <p className="text-sm whitespace-pre-wrap">{aiResponse.response}</p>

          {aiResponse.suggestedAction?.reason && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Reason: {aiResponse.suggestedAction.reason}
            </p>
          )}

          {aiResponse.suggestedAction && (
            <div className="mt-4 rounded-lg border bg-blue-50/50 p-4">
              <p className="text-xs font-medium mb-2">Preview:</p>
              <div className="rounded border bg-white p-3 text-sm font-mono">
                {aiResponse.suggestedAction.content}
              </div>
              <Button
                onClick={handleApply}
                size="sm"
                className="w-full mt-3"
                disabled={applied || !editor}
              >
                {applied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Applied!
                  </>
                ) : (
                  "Apply to Selection"
                )}
              </Button>
            </div>
          )}

          {!aiResponse.suggestedAction && (
            <Button
              onClick={() => handleCopy(aiResponse.response)}
              variant="secondary"
              size="sm"
              className="w-full mt-4"
            >
              <Clipboard className="mr-2 h-4 w-4" />
              Copy Response
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
