"use client"

import React from "react"
import { ChevronDown, AlignVerticalSpaceBetween } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToolbar } from "./toolbar-provider"
import { useMediaQuery } from "@/hooks/use-media-querry"
import { MobileToolbarGroup, MobileToolbarItem } from "./mobile-toolbar-group"

const lineHeights = ['1.15', '1.5', '1.75', '2.0'] as const

export const LineHeightToolbar = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { editor } = useToolbar()
    const isMobile = useMediaQuery("(max-width: 640px)")
    const activeLevel = lineHeights.find((level) => editor?.isActive("textStyle", { lineHeight: level }))

    const isNormalActive = !lineHeights.some((level) => editor?.isActive("textStyle", { lineHeight: level }))

    if (isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <MobileToolbarGroup label={activeLevel ? `${activeLevel}x` : "Normal"}>
              <MobileToolbarItem
                onClick={() => editor?.chain().focus().unsetLineHeight().run()}
                active={isNormalActive}
              >
                Normal
              </MobileToolbarItem>
              {lineHeights.map((level) => (
                <MobileToolbarItem
                  key={level}
                  onClick={() => editor?.chain().focus().toggleTextStyle({ lineHeight: level }).run()}
                  active={editor?.isActive("textStyle", { lineHeight: level })}
                >
                  {level}x
                </MobileToolbarItem>
              ))}
            </MobileToolbarGroup>
          </TooltipTrigger>
          <TooltipContent>
            <span>Line Height</span>
          </TooltipContent>
        </Tooltip>
      )
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
                  editor?.isActive("textStyle") && "bg-accent",
                  className,
                )}
                ref={ref}
                {...props}
              >
                {activeLevel ? `${activeLevel}x` : <AlignVerticalSpaceBetween className="h-4 w-4" />}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <span>Line Height</span>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => editor?.chain().focus().unsetLineHeight().run()}
            className={cn("flex items-center gap-2 h-fit", isNormalActive && "bg-accent")}
          >
            Normal
          </DropdownMenuItem>
          {lineHeights.map((level) => (
            <DropdownMenuItem
              key={level}
              onClick={() => editor?.chain().focus().toggleTextStyle({ lineHeight: level }).run()}
              className={cn("flex items-center gap-2", editor?.isActive("textStyle", { lineHeight: level }) && "bg-accent")}
            >
              {level}x
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
)

LineHeightToolbar.displayName = "LineHeightToolbar"