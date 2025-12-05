/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, X, Clipboard, Check } from "lucide-react";
import { Editor } from "@tiptap/core"; // NEW: Import for types
import { cn } from "@/lib/utils";

interface AskAIPopupProps {
  selectedText: string;
  position?: { x: number; y: number };
  onClose: () => void;
  editor: Editor | null; // NEW: For applying changes
  selectionRange: { from: number; to: number }; // NEW: Original selection for precise replace
}

interface AIResponse {
  response: string;
  suggestedAction?: {
    type: 'replace' | 'insert';
    content: string;
    reason: string;
  };
}

export function AskAIPopup({ 
  selectedText, 
  onClose, 
  editor, 
  selectionRange 
}: AskAIPopupProps) {
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false); // NEW: Visual feedback
  const cardRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const target = e.target as Node;
      if (!cardRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

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
          action: question.toLowerCase().includes("rewrite") ? "rewrite" : 
                  question.toLowerCase().includes("summarize") ? "summarize" : "general"
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json() as AIResponse;
      setAiResponse(data);
    } catch (err) {
      setError("Failed to get AI response. Try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!editor || !aiResponse?.suggestedAction) return;

    const { type, content } = aiResponse.suggestedAction;
    editor.chain()
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
    // Optional: Show toast "Copied!"
  };

  return (
    <Card
      ref={cardRef}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-background border shadow-xl rounded-2xl z-9999 animate-in fade-in duration-200",
        applied && "border-green-500" 
      )}
    >
      <CardContent className="p-0 pt-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Ask AI</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Context */}
        <div className="mb-3 rounded-md bg-muted/40 p-3">
          <p className="text-[10px] font-medium uppercase text-muted-foreground mb-1">
            Selected Text
          </p>
          <p className="text-xs italic text-foreground/70 line-clamp-2">
            “{selectedText}”
          </p>
        </div>

        {/* Query Input */}
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Ask to rewrite, summarize, explain, or expand..."
          className="resize-none text-sm mb-3 h-16"
          disabled={isLoading}
        />

        {/* Ask Button */}
        <Button
          onClick={handleAskAI}
          disabled={isLoading || !question.trim()}
          className="w-full mb-3"
          size="sm"
          variant="outline"
        >
          {isLoading ? (
            <>
              <Sparkles className="mr-2 h-3 w-3 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-3 w-3" />
              Get Suggestion
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive mb-3 text-center">{error}</p>
        )}

        {/* AI Response */}
        {aiResponse && (
          <>
            <div className="mb-3 p-3 bg-muted/20 rounded-md">
              <p className="text-xs text-foreground">{aiResponse.response}</p>
              {aiResponse.suggestedAction?.reason && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Reason: {aiResponse.suggestedAction.reason}
                </p>
              )}
            </div>

            {/* Suggestion Preview & Apply */}
            {aiResponse.suggestedAction && (
              <div className="mb-3 p-3 border rounded-md bg-blue/10">
                <p className="text-xs font-medium mb-1">Preview:</p>
                <p className="text-xs bg-white p-2 rounded border font-mono">
                  {aiResponse.suggestedAction.content}
                </p>
                <Button
                  onClick={handleApply}
                  size="sm"
                  className="w-full mt-2"
                  disabled={applied || !editor}
                >
                  {applied ? (
                    <>
                      <Check className="mr-2 h-3 w-3" />
                      Applied!
                    </>
                  ) : (
                    "Apply to Selection"
                  )}
                </Button>
              </div>
            )}

            {/* Copy Response */}
            {!aiResponse.suggestedAction && (
              <Button
                onClick={() => handleCopy(aiResponse.response)}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                <Clipboard className="mr-2 h-3 w-3" />
                Copy Response
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}