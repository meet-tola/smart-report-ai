"use client";

import { useState, useEffect } from "react";
import type { Editor } from "@tiptap/core";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface FontFamilyToolbarProps {
  editor: Editor;
}

// Expandable font list
const availableFonts = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "Roboto",
  "Montserrat",
  "Lato",
  "Calibri",
  "Garamond",
  "Comic Sans MS",
];

export function FontFamilyToolbar({ editor }: FontFamilyToolbarProps) {
  const [currentFont, setCurrentFont] = useState("Arial");

  // Sync current font when editor updates selection
  useEffect(() => {
    if (!editor) return;

    const updateFont = () => {
      const mark = editor.getAttributes("textStyle");
      const font = mark?.fontFamily || "Arial";
      setCurrentFont((prev) => (prev !== font ? font : prev));
    };

    // Run once initially
    updateFont();

    // Subscribe to selection updates
    editor.on("selectionUpdate", updateFont);

    // Cleanup
    return () => {
      editor.off("selectionUpdate", updateFont);
    };
  }, [editor]);

  const handleChange = (font: string) => {
    setCurrentFont(font);
    editor.chain().focus().setMark("textStyle", { fontFamily: font }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center justify-between gap-2 min-w-[140px] text-sm font-normal"
          )}
          style={{ fontFamily: currentFont }}
        >
          {currentFont}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
        {availableFonts.map((font) => (
          <DropdownMenuItem
            key={font}
            onClick={() => handleChange(font)}
            style={{ fontFamily: font }}
            className={cn(
              "cursor-pointer text-sm",
              font === currentFont && "bg-accent text-accent-foreground"
            )}
          >
            {font}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
