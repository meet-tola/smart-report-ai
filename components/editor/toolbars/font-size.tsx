"use client";

import React, { useEffect, useReducer } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";

const FontSizeToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { editor } = useToolbar();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => forceUpdate();
    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  const currentSize = editor.getAttributes("textStyle").fontSize as string || "16px";
  const numValue = parseInt(currentSize.replace(/px$/, ""), 10) || 16; // Fallback to 16 if parse fails

  const handleIncrease = () => {
    const newSize = `${Math.min(72, numValue + 2)}px`;
    editor.chain().focus().setFontSize(newSize).run();
    forceUpdate(); // Optional: Ensure immediate UI update after change
  };

  const handleDecrease = () => {
    const newSize = `${Math.max(8, numValue - 2)}px`;
    editor.chain().focus().setFontSize(newSize).run();
    forceUpdate(); // Optional: Ensure immediate UI update after change
  };

  const isActive = !!currentSize && currentSize !== "16px";

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-0.5 rounded-md border bg-background p-0.5",
        isActive && "border-accent bg-accent/10",
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-7 w-7 p-0", isActive && "bg-accent/20")}
        onClick={handleDecrease}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <div className="px-2 py-1 text-xs font-medium text-foreground min-w-12 text-center">
        {numValue}px
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-7 w-7 p-0", isActive && "bg-accent/20")}
        onClick={handleIncrease}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
});

FontSizeToolbar.displayName = "FontSizeToolbar";

export { FontSizeToolbar };