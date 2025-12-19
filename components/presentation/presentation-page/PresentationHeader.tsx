/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { usePresentationState } from "@/states/presentation-state";
import { BrainCircuit, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import * as motion from "framer-motion/client";
import { ExportButton } from "./buttons/ExportButton";
import { PresentButton } from "./buttons/PresentButton";
import { SaveStatus } from "./buttons/SaveStatus";
import { ShareButton } from "./buttons/ShareButton";

interface PresentationHeaderProps {
  title?: string;
}

export default function PresentationHeader({ title }: PresentationHeaderProps) {
  const currentPresentationTitle = usePresentationState(
    (s) => s.currentPresentationTitle,
  );
  const isPresenting = usePresentationState((s) => s.isPresenting);
  const currentPresentationId = usePresentationState(
    (s) => s.currentPresentationId,
  );
  const [presentationTitle, setPresentationTitle] =
    useState<string>("Presentation");
  const pathname = usePathname();
  // Check if we're on the generate/outline page
  const isPresentationPage =
    pathname.startsWith("/presentation/") && !pathname.includes("generate");

  // Update title when it changes in the state
  useEffect(() => {
    if (currentPresentationTitle) {
      setPresentationTitle(currentPresentationTitle);
    } else if (title) {
      setPresentationTitle(title);
    }
  }, [currentPresentationTitle, title]);

  if (pathname === "/presentation/create")
    return (
      <header className="flex h-12 max-w-[100vw]  items-center justify-between overflow-clip border-accent px-2 py-2">
        <div className="flex items-center gap-2">
          {/* This component is suppose to be logo but for now its is actually hamburger menu */}

          <Link href={"/presentation/create"}>
            <Button size={"icon"} className="rounded-full" variant={"ghost"}>
              <BrainCircuit /> 
            </Button>
          </Link>

          <motion.div
            initial={false}
            layout="position"
            transition={{ duration: 1 }}
          >
          </motion.div>
        </div>

        {/* <SideBarDropdown /> */}
      </header>
    );

  return (
    <header className="flex h-12 w-full items-center justify-between border-b border-accent bg-background px-4">
      {/* Left section with breadcrumb navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/presentation"
          className="text-muted-foreground hover:text-foreground"
        >
              <BrainCircuit /> 
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{presentationTitle}</span>
      </div>

      {/* Right section with actions */}
      <div className="flex items-center gap-2">
        {/* Save status indicator */}
        <SaveStatus />

        {/* Theme selector moved to right editor panel */}

        {/* Export button - Only in presentation page, not outline or present mode */}
        {isPresentationPage && !isPresenting && (
          <ExportButton presentationId={currentPresentationId ?? ""} />
        )}

        {/* Share button - Only in presentation page, not outline */}
        {isPresentationPage && !isPresenting && <ShareButton />}

        {/* Present button - Only in presentation page, not outline */}
        {isPresentationPage && <PresentButton />}
      </div>
    </header>
  );
}
