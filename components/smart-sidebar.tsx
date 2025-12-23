/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Sparkles, BookOpen, Link2, Send, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Editor } from "@tiptap/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SmartSidebarProps {
  className?: string;
  onClose?: () => void;
  isOpen?: boolean;
  editor?: Editor | null;
  documentId: string;
  suggestedReplaces?: Array<{
    original: string;
    replacement: string;
    reason: string;
    confidence: number;
  }>;
  onReplacesUpdate?: (replaces: any[]) => void;
  references?: Array<{
    title: string;
    authors: string;
    year: string;
    url: string;
  }>;
}

interface ChatMessage {
  role: string;
  content: string;
  suggestedAction?: {
    type: "replace" | "insert";
    position?: number;
    content: string;
    reason: string;
    original?: string;
    originalRange?: { from: number; to: number };
  };
}

export function SmartSidebar({
  className,
  onClose,
  isOpen = true,
  editor,
  documentId,
  suggestedReplaces = [],
  onReplacesUpdate,
  references,
}: SmartSidebarProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. Select any text in the document and ask me questions, or request changes.",
    },
  ]);
  const [input, setInput] = useState("");
  const [currentReplaces, setCurrentReplaces] = useState(suggestedReplaces);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    ChatMessage["suggestedAction"] | null
  >(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    setCurrentReplaces(suggestedReplaces);
  }, [suggestedReplaces]);

  const getSelectedText = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      return editor.state.doc.textBetween(from, to, " ");
    }
    return window.getSelection()?.toString() || "";
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      suggestedAction: undefined,
    };
    setChatMessages((prev) => [...prev, userMessage]);
    const selectedText = getSelectedText();
    const originalRange = editor
      ? { from: editor.state.selection.from, to: editor.state.selection.to }
      : undefined; // NEW: Capture range
    setInput("");

    try {
      const res = await fetch("/api/document/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          context: selectedText,
          documentId,
          action: "chat",
        }),
      });
      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        suggestedAction: data.suggestedAction,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);

      if (data.updatedReplaces) {
        setCurrentReplaces((prev) => [...prev, ...data.updatedReplaces]);
        onReplacesUpdate?.(currentReplaces);
      }

      if (data.suggestedAction) {
        const augmentedAction =
          data.suggestedAction.type === "replace"
            ? { ...data.suggestedAction, original: selectedText, originalRange }
            : data.suggestedAction;
        setPendingAction(augmentedAction);
        setShowActionDialog(true);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
  };

  const handleApplyAction = () => {
    if (!editor || !pendingAction) return;

    try {
      const { type, content, originalRange, position } = pendingAction;
      if (type === "replace") {
        if (originalRange) {
          editor
            .chain()
            .focus()
            .setTextSelection(originalRange)
            .insertContent(content)
            .run();
        } else {
          editor.chain().focus().insertContent(content).run();
        }
      } else if (type === "insert") {
        const pos =
          position ??
          /* fallback to current selection */ editor.state.selection.from;
        editor
          .chain()
          .focus()
          .setTextSelection(pos)
          .insertContent(content)
          .run();
      }

      setShowActionDialog(false);
      setPendingAction(null);

      // Confirmation in chat
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Applied ${
            pendingAction.type
          }: ${pendingAction.content.substring(0, 50)}... (${
            pendingAction.reason
          })`,
        },
      ]);
    } catch (error) {
      console.error("Apply action failed:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Failed to apply ${pendingAction.type}. Please try again.`,
        },
      ]);
    }
  };

  const handleApplyReplace = (replace: {
    original: string;
    replacement: string;
    reason: string;
  }) => {
    if (!editor) return;

    try {
      // Use the SearchAndReplace commands to set terms and replace all matches
      editor
        .chain()
        .focus()
        .setSearchTerm(replace.original)
        .setReplaceTerm(replace.replacement)
        .replaceAll()
        .run();

      // Remove from replaces list after successful apply
      setCurrentReplaces((prev) =>
        prev.filter((r) => r.original !== replace.original)
      );
      onReplacesUpdate?.(
        currentReplaces.filter((r) => r.original !== replace.original)
      );

      // Add a confirmation to chat messages for user feedback
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Successfully replaced "${replace.original}" with "${replace.replacement}" in places. Reason: ${replace.reason}`,
        },
      ]);
    } catch (error) {
      console.error("Replace failed:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Failed to apply replacement for "${replace.original}". Please try manually.`,
        },
      ]);
    }
  };

  const referencesList = references || [];

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Smart Assistant
        </h2>
        {/* Close buttons */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs defaultValue="chat" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4 grid w-auto grid-cols-3 bg-muted/50 p-1 h-auto">
          <TabsTrigger value="chat" className="text-xs py-1.5">Chat</TabsTrigger>
          <TabsTrigger value="sources" className="text-xs py-1.5">Sources</TabsTrigger>
          <TabsTrigger value="references" className="text-xs py-1.5">Replace</TabsTrigger>
        </TabsList>

        {/* Chat Tab - Scrollable messages + sticky input */}
        <TabsContent value="chat" className="flex-1 flex flex-col px-4 pb-4 mt-3 overflow-hidden">
          <ScrollArea className="flex-1 pr-4 -mx-4 px-4">
            <div className="space-y-3 py-4 min-h-full">
              {chatMessages.map((message, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-lg p-3 text-xs leading-relaxed max-w-[90%]",
                    message.role === "user"
                      ? "ml-6 bg-primary text-primary-foreground"
                      : "mr-2 bg-muted text-foreground"
                  )}
                >
                  {message.content}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Sticky Input at Bottom */}
          <div className="flex gap-2 pt-3 shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder="Ask anything..."
              className="flex-1 h-9 text-xs bg-background"
            />
            <Button size="sm" onClick={handleSendMessage} className="h-9 px-3">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TabsContent>

        {/* Sources Tab - Fully scrollable */}
        <TabsContent value="sources" className="flex-1 px-4 pb-4 mt-3 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-2 py-4">
              {referencesList.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No sources available yet.
                </p>
              ) : (
                referencesList.map((ref, idx) => (
                  <Card key={idx} className="p-3 border-border/50 shadow-none">
                    <CardContent className="p-0 pt-3">
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-0.5 min-w-0">
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium truncate hover:underline text-primary"
                          >
                            {ref.title}
                          </a>
                          <p className="text-xs text-muted-foreground">
                            {ref.authors}, {ref.year}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              <Button variant="outline" className="w-full bg-transparent mt-3 h-8 text-xs" size="sm">
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                Add Source
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Replace Tab - Fully scrollable */}
        <TabsContent value="references" className="flex-1 px-4 pb-4 mt-3 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-2 py-4">
              {currentReplaces.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No suggested replaces yet. Chat with AI to get ideas.
                </p>
              ) : (
                currentReplaces.map((replace, idx) => (
                  <Card key={idx} className="p-3 border-border/50 bg-muted/30">
                    <CardContent className="p-0 pt-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <p className="text-xs font-medium truncate">
                              Replace "{replace.original}"
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            With: {replace.replacement}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            {replace.reason} (Confidence: {(replace.confidence * 100).toFixed(0)}%)
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleApplyReplace(replace)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              <Button variant="outline" className="w-full bg-transparent mt-3 h-8 text-xs" size="sm">
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                Add Replace
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Action Confirmation Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply AI Suggestion?</DialogTitle>
            <DialogDescription>
              {pendingAction?.type === "replace" ? (
                <>
                  Replace "{pendingAction.original}" with "
                  {pendingAction.content}"?
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {pendingAction.reason}
                  </span>
                </>
              ) : (
                <>
                  Insert "{pendingAction?.content.substring(0, 50)}..." at
                  position {pendingAction?.position ?? "cursor"}?
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {pendingAction?.reason}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActionDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApplyAction}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
