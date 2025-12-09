"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";
import { useMediaQuery } from "@/hooks/use-media-querry";
import { MobileToolbarGroup, MobileToolbarItem } from "./mobile-toolbar-group";

const levels = [1, 2, 3, 4, 5, 6] as const;
type Level = typeof levels[number];

export const BlockFormatToolbar = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { editor } = useToolbar();
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (!editor) return null;

  const activeLevel = levels.find((level) => editor.isActive("heading", { level }));
  const isBulletActive = editor.isActive("bulletList");
  const isOrderedActive = editor.isActive("orderedList");
  const isBlockquoteActive = editor.isActive("blockquote");
  const isCodeBlockActive = editor.isActive("codeBlock");
  const isNormalActive = !activeLevel && !isBulletActive && !isOrderedActive && !isBlockquoteActive && !isCodeBlockActive;

  // Determine trigger content for desktop (short text)
  let triggerContent = "Text";
  if (activeLevel) {
    triggerContent = `H${activeLevel}`;
  } else if (isBulletActive) {
    triggerContent = "• List";
  } else if (isOrderedActive) {
    triggerContent = "1. List";
  } else if (isBlockquoteActive) {
    triggerContent = "Quote";
  } else if (isCodeBlockActive) {
    triggerContent = "Code";
  }

  // Determine label for mobile
  let mobileLabel = "Normal";
  if (activeLevel) {
    mobileLabel = `Heading ${activeLevel}`;
  } else if (isBulletActive) {
    mobileLabel = "Bullet list";
  } else if (isOrderedActive) {
    mobileLabel = "Ordered list";
  } else if (isBlockquoteActive) {
    mobileLabel = "Blockquote";
  } else if (isCodeBlockActive) {
    mobileLabel = "Code block";
  }

  const setNormal = () => editor.chain().focus().setParagraph().run();
  const toggleHeading = (level: Level) => editor.chain().focus().toggleHeading({ level }).run();
  const toggleBullet = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrdered = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();

  if (isMobile) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <MobileToolbarGroup label={mobileLabel}>
            <MobileToolbarItem
              onClick={setNormal}
              active={isNormalActive}
            >
              Normal Text
            </MobileToolbarItem>
            {levels.map((level) => (
              <MobileToolbarItem
                key={level}
                onClick={() => toggleHeading(level)}
                active={editor.isActive("heading", { level })}
              >
                Heading {level}
              </MobileToolbarItem>
            ))}
            <MobileToolbarItem
              onClick={toggleBullet}
              active={isBulletActive}
            >
              • Bullet list
            </MobileToolbarItem>
            <MobileToolbarItem
              onClick={toggleOrdered}
              active={isOrderedActive}
            >
              1. Ordered list
            </MobileToolbarItem>
            <MobileToolbarItem
              onClick={toggleBlockquote}
              active={isBlockquoteActive}
            >
              Blockquote
            </MobileToolbarItem>
            <MobileToolbarItem
              onClick={toggleCodeBlock}
              active={isCodeBlockActive}
            >
              Code block
            </MobileToolbarItem>
          </MobileToolbarGroup>
        </TooltipTrigger>
        <TooltipContent>
          <span>Block format</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-max gap-1 px-3 font-normal",
                (activeLevel || isBulletActive || isOrderedActive || isBlockquoteActive || isCodeBlockActive) && "bg-accent",
                className,
              )}
              ref={ref}
              {...props}
            >
              {triggerContent}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Block format</span>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={setNormal}
          className={cn("flex items-center gap-2 h-fit", isNormalActive && "bg-accent")}
        >
          Normal Text
        </DropdownMenuItem>
        {levels.map((level) => (
          <DropdownMenuItem
            key={level}
            onClick={() => toggleHeading(level)}
            className={cn("flex items-center gap-2", editor.isActive("heading", { level }) && "bg-accent")}
          >
            Heading {level}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={toggleBullet}
          className={cn("flex items-center gap-2", isBulletActive && "bg-accent")}
        >
          • Bullet list
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={toggleOrdered}
          className={cn("flex items-center gap-2", isOrderedActive && "bg-accent")}
        >
          1. Ordered list
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={toggleBlockquote}
          className={cn("flex items-center gap-2", isBlockquoteActive && "bg-accent")}
        >
          Blockquote
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={toggleCodeBlock}
          className={cn("flex items-center gap-2", isCodeBlockActive && "bg-accent")}
        >
          Code block
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

BlockFormatToolbar.displayName = "BlockFormatToolbar";