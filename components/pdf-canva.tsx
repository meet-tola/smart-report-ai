"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";

// Dynamically import both components (to avoid SSR issues)
const PDFViewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false }
);

const PDFWorker = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Worker),
  { ssr: false }
);

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFCanvasProps {
  fileUrl: string;
}

export default function PDFCanvas({ fileUrl }: PDFCanvasProps) {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Zoom controls */}
      <div className="flex gap-2 items-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setZoom((z) => Math.max(z - 10, 50))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setZoom((z) => Math.min(z + 10, 200))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => setZoom(100)}>
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>

      {/* PDF viewer inside Worker */}
      <div
        style={{
          width: "100%",
          height: "85vh",
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
        className="border border-border rounded-lg shadow-lg overflow-auto bg-white dark:bg-slate-900"
      >
        <PDFWorker workerUrl="/pdf.worker.min.js">
          <PDFViewer fileUrl={fileUrl} />
        </PDFWorker>
      </div>
    </div>
  );
}
